import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// Cache agent status and usage data for 60 seconds to speed up dashboard refreshes and reduce API calls
let statusCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 60000;

// Interface for model cost configuration
interface ModelCostConfig {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
}

// Interface for model pricing loaded from config
interface ModelPricing {
  [modelId: string]: ModelCostConfig;
}

// Load model pricing from OpenClaw config
async function loadModelPricing(): Promise<ModelPricing> {
  const pricing: ModelPricing = {};
  
  try {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    const providers = config.models?.providers || {};
    
    for (const [providerId, providerConfig] of Object.entries(providers)) {
      const models = (providerConfig as any).models || [];
      for (const model of models) {
        if (model.cost) {
          pricing[model.id] = model.cost;
        }
        // Also index by short name (after the slash)
        if (model.id.includes('/')) {
          const shortName = model.id.split('/').pop();
          if (shortName && !pricing[shortName]) {
            pricing[shortName] = model.cost;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not load model pricing from config:', e);
  }
  
  return pricing;
}

// Calculate cost for a model given input/output tokens
// Cost config values are $ per MILLION tokens
function calculateCost(pricing: ModelPricing, modelId: string, inputTokens: number, outputTokens: number): number {
  // Try exact match first
  let costConfig = pricing[modelId];
  
  // Try short name (after the slash)
  if (!costConfig && modelId.includes('/')) {
    const shortName = modelId.split('/').pop();
    if (shortName) {
      costConfig = pricing[shortName];
    }
  }
  
  // Try contains match (e.g., "claude-sonnet-4-5" matches "anthropic/claude-sonnet-4-5")
  if (!costConfig) {
    for (const [configModelId, config] of Object.entries(pricing)) {
      if (modelId.toLowerCase().includes(configModelId.toLowerCase()) ||
          configModelId.toLowerCase().includes(modelId.toLowerCase())) {
        costConfig = config;
        break;
      }
    }
  }
  
  if (!costConfig) {
    return 0;
  }
  
  // Cost is $ per million tokens
  const inputCost = ((inputTokens || 0) / 1_000_000) * (costConfig.input || 0);
  const outputCost = ((outputTokens || 0) / 1_000_000) * (costConfig.output || 0);
  
  return inputCost + outputCost;
}

// Helper function to format age string
function formatAge(ageMs: number): string {
  if (!ageMs) return 'unknown';
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function GET() {
  try {
    const now = Date.now();
    if (statusCache && (now - statusCache.timestamp < CACHE_TTL)) {
      return NextResponse.json(statusCache.data);
    }

    // 1. Load model pricing from OpenClaw config
    const modelPricing = await loadModelPricing();
    
    // 2. Get agent list from OpenClaw CLI (native)
    let localAgents: any[] = [];
    try {
      const { stdout: agentsJson } = await execAsync('openclaw agents list --json');
      const agentsData = JSON.parse(agentsJson);
      
      localAgents = agentsData.map((agent: any) => ({
        id: agent.id,
        name: agent.name || agent.identityName || agent.id,
        role: agent.identityName !== agent.name ? agent.identityName : undefined,
        status: 'OK',
        active: 'unknown',
        sessionsCount: 0,
        workspaceDir: agent.workspace,
        model: agent.model,
        cost: 0
      }));
    } catch (e) {
      console.warn('Could not fetch agent list from CLI:', e);
    }

    // 3. Get session data from OpenClaw CLI (native)
    let allSessions: any[] = [];
    try {
      const { stdout: sessionsJson } = await execAsync('openclaw sessions --active 14400 --all-agents --json');
      const sessionsData = JSON.parse(sessionsJson);
      allSessions = sessionsData.sessions || [];
    } catch (e) {
      console.warn('Could not fetch session list from CLI:', e);
    }

    // 4. Aggregate usage data by model
    const modelBreakdown: Record<string, { model: string; cost: number; promptTokens: number; completionTokens: number; totalTokens: number }> = {};
    
    for (const session of allSessions) {
      const model = session.model || 'unknown';
      const inputTokens = session.inputTokens || 0;
      const outputTokens = session.outputTokens || 0;
      
      if (!modelBreakdown[model]) {
        modelBreakdown[model] = {
          model: model,
          cost: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
      }
      
      // Calculate cost using model pricing
      const sessionCost = calculateCost(modelPricing, model, inputTokens, outputTokens);
      modelBreakdown[model].cost += sessionCost;
      modelBreakdown[model].promptTokens += inputTokens;
      modelBreakdown[model].completionTokens += outputTokens;
      modelBreakdown[model].totalTokens += inputTokens + outputTokens;
    }
    
    const modelBreakdownArray = Object.values(modelBreakdown).sort((a, b) => b.cost - a.cost);
    
    const totalCost = modelBreakdownArray.reduce((sum, entry) => sum + entry.cost, 0);
    const totalPrompts = modelBreakdownArray.reduce((sum, entry) => sum + entry.promptTokens, 0);
    const totalCompletions = modelBreakdownArray.reduce((sum, entry) => sum + entry.completionTokens, 0);
    const totalTokens = totalPrompts + totalCompletions;
    
    const usageSummary = {
      totalCost,
      totalPrompts,
      totalCompletions,
      totalTokens,
      modelBreakdown: modelBreakdownArray
    };

    // 5. Enrich agents with usage data
    const agentData = localAgents.map(agent => {
      // Find sessions matching this agent
      const agentSessions = allSessions.filter((s: any) => 
        s.key && s.key.startsWith(`agent:${agent.id}:`)
      );
      
      // Aggregate usage by model for this agent
      const agentModelUsage: Record<string, { model: string; prompt_tokens: number; completion_tokens: number; cost: number }> = {};
      
      for (const session of agentSessions) {
        const model = session.model || 'unknown';
        const inputTokens = session.inputTokens || 0;
        const outputTokens = session.outputTokens || 0;
        
        if (!agentModelUsage[model]) {
          agentModelUsage[model] = {
            model: model,
            prompt_tokens: 0,
            completion_tokens: 0,
            cost: 0
          };
        }
        
        const sessionCost = calculateCost(modelPricing, model, inputTokens, outputTokens);
        agentModelUsage[model].prompt_tokens += inputTokens;
        agentModelUsage[model].completion_tokens += outputTokens;
        agentModelUsage[model].cost += sessionCost;
      }
      
      const modelUsage = Object.values(agentModelUsage);
      const agentTotalTokens = modelUsage.reduce((sum, m) => sum + m.prompt_tokens + m.completion_tokens, 0);
      const agentTotalCost = modelUsage.reduce((sum, m) => sum + m.cost, 0);
      
      return {
        ...agent,
        cost: agentTotalCost,
        tokenCount: agentTotalTokens,
        modelUsage: modelUsage,
        sessionsCount: agentSessions.length
      };
    });

    const responseData = {
      agents: agentData,
      openRouterSummary: usageSummary,
      timestamp: new Date().toISOString(),
    };

    statusCache = { data: responseData, timestamp: now };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status', details: error.message },
      { status: 500 }
    );
  }
}
