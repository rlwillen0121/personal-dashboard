import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Cache agent status and usage data for 60 seconds to speed up dashboard refreshes and reduce API calls
let statusCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 60000;

// Helper function to find all session JSONL files
function findSessionFiles(): string[] {
  const agentsDir = '/home/ryanw/.openclaw/agents';
  const files: string[] = [];
  
  try {
    const dirs = fs.readdirSync(agentsDir);
    for (const dir of dirs) {
      const sessionDir = path.join(agentsDir, dir, 'sessions');
      try {
        const sessionFiles = fs.readdirSync(sessionDir);
        for (const file of sessionFiles) {
          if (file.endsWith('.jsonl')) {
            files.push(path.join(sessionDir, file));
          }
        }
      } catch (e) {
        // Skip directories without sessions
      }
    }
  } catch (e) {
    console.warn('Could not read agents directory', e);
  }
  
  return files;
}

// Helper function to parse a single JSONL file and extract usage data
function parseSessionFile(filePath: string): any[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return [];
  }
}

// Extract usage data from session messages
function extractUsageData(messages: any[]): { model: string; input: number; output: number; cost: number }[] {
  const usageData: { model: string; input: number; output: number; cost: number }[] = [];
  
  for (const msg of messages) {
    if (msg.type === 'message' && msg.message) {
      const usage = msg.message.usage;
      if (usage) {
        usageData.push({
          model: msg.message.model || 'unknown',
          input: usage.input || 0,
          output: usage.output || 0,
          cost: usage.cost?.total || 0
        });
      }
    }
  }
  
  return usageData;
}

// Aggregate usage data by model
function aggregateUsageData(usageData: { model: string; input: number; output: number; cost: number }[]): {
  totalCost: number;
  totalPrompts: number;
  totalCompletions: number;
  totalTokens: number;
  modelBreakdown: { model: string; cost: number; promptTokens: number; completionTokens: number; totalTokens: number }[];
} {
  const modelBreakdown: Record<string, { model: string; cost: number; promptTokens: number; completionTokens: number; totalTokens: number }> = {};
  
  for (const data of usageData) {
    const model = data.model;
    if (!modelBreakdown[model]) {
      modelBreakdown[model] = {
        model: model,
        cost: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      };
    }
    
    modelBreakdown[model].cost += data.cost;
    modelBreakdown[model].promptTokens += data.input;
    modelBreakdown[model].completionTokens += data.output;
    modelBreakdown[model].totalTokens += data.input + data.output;
  }
  
  const modelBreakdownArray = Object.values(modelBreakdown).sort((a, b) => b.cost - a.cost);
  
  const totalCost = usageData.reduce((sum, d) => sum + d.cost, 0);
  const totalPrompts = usageData.reduce((sum, d) => sum + d.input, 0);
  const totalCompletions = usageData.reduce((sum, d) => sum + d.output, 0);
  const totalTokens = totalPrompts + totalCompletions;
  
  return {
    totalCost,
    totalPrompts,
    totalCompletions,
    totalTokens,
    modelBreakdown: modelBreakdownArray
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (statusCache && (now - statusCache.timestamp < CACHE_TTL)) {
      return NextResponse.json(statusCache.data);
    }

    // 1. Get all session JSONL files
    const sessionFiles = findSessionFiles();
    
    // 2. Extract usage data from all session files
    let allUsageData: { model: string; input: number; output: number; cost: number }[] = [];
    
    for (const file of sessionFiles) {
      const messages = parseSessionFile(file);
      const usageData = extractUsageData(messages);
      allUsageData = allUsageData.concat(usageData);
    }
    
    // 3. Aggregate usage data by model
    const usageSummary = aggregateUsageData(allUsageData);

    // 4. Get detailed agent list from the CLI for local agents
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    let localAgents: any[] = [];
    try {
      const { stdout: statusAll } = await execAsync('openclaw status --all --plain');
      localAgents = parseAgentList(statusAll);
    } catch (e) {
      console.warn('Could not fetch local agent list', e);
    }

    // 5. Enrich local agents with usage data by matching model names
    const agentData = localAgents.map(agent => {
      const agentNameLower = agent.id.toLowerCase();
      
      // Find usage entries matching this agent's name or model
      const matchingUsage = usageSummary.modelBreakdown.filter(entry =>
        entry.model.toLowerCase().includes(agentNameLower) ||
        agentNameLower.includes(entry.model.toLowerCase().split('/')[1] || entry.model)
      );
      
      const totalTokens = matchingUsage.reduce((sum, entry) => sum + entry.totalTokens, 0);
      const totalCost = matchingUsage.reduce((sum, entry) => sum + entry.cost, 0);
      
      const modelUsage = matchingUsage.map(entry => ({
        model: entry.model,
        prompt_tokens: entry.promptTokens,
        completion_tokens: entry.completionTokens,
        cost: entry.cost
      }));

      return {
        ...agent,
        cost: totalCost,
        tokenCount: totalTokens,
        modelUsage: modelUsage
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

function parseAgentList(statusOutput: string) {
  const agents: any[] = [];
  const statusLines = statusOutput.split('\n');
  
  let inAgentsTable = false;
  for (const line of statusLines) {
    // Detect start of Agents table
    if (line.includes('Agent') && line.includes('Bootstrap') && line.includes('Sessions')) {
      inAgentsTable = true;
      continue;
    }
    
    if (inAgentsTable) {
      if (line.startsWith('└')) { inAgentsTable = false; continue; }
      if (line.startsWith('├')) continue;
      
      const parts = line.split('│').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 4) {
        // Extract ID and Name
        // Example: "main (Assistant)"
        const rawName = parts[0];
        const nameMatch = rawName.match(/^([^(]+)(?:\(([^)]+)\))?$/);
        
        const id = nameMatch ? nameMatch[1].trim().toLowerCase() : rawName.toLowerCase();
        const displayName = nameMatch ? nameMatch[1].trim() : rawName;
        const role = nameMatch && nameMatch[2] ? nameMatch[2].trim() : '';

        agents.push({
          id,
          name: displayName,
          role,
          status: parts[1], // OK or PENDING
          active: parts[3], // "just now", "20m ago"
          cost: 0 
        });
      }
    }
  }
  
  return agents;
}
