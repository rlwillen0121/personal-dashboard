import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // 1. Get detailed status for roles/names
    const { stdout: statusAll } = await execAsync('openclaw status --all');
    
    // 2. Get latest sessions for token counting (substitute for costs)
    const { stdout: sessionsList } = await execAsync('openclaw sessions list --limit 50 --active-minutes 1440 --kinds group,direct');
    
    const agents = parseStatus(statusAll, sessionsList);

    return NextResponse.json({
      agents,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status', details: error.message },
      { status: 500 }
    );
  }
}

function parseStatus(statusOutput: string, sessionsOutput: string) {
  const agentsMap = new Map();
  const statusLines = statusOutput.split('\n');
  
  // A. Parse Agent Roles/Bootstrap status
  let inAgentsTable = false;
  for (const line of statusLines) {
    if (line.includes('Agent') && line.includes('Bootstrap') && line.includes('Sessions')) {
      inAgentsTable = true;
      continue;
    }
    if (inAgentsTable) {
      if (line.startsWith('└')) { inAgentsTable = false; continue; }
      if (line.startsWith('├')) continue;
      
      const parts = line.split('│').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 4) {
        const nameMatch = parts[0].match(/^([^(]+)(?:\(([^)]+)\))?$/);
        const id = nameMatch ? nameMatch[1].trim() : parts[0];
        agentsMap.set(id, {
          name: id,
          role: nameMatch && nameMatch[2] ? nameMatch[2].trim() : '',
          status: parts[1],
          sessions: parseInt(parts[2], 10) || 0,
          active: parts[3],
          tokenCount: 0,
          cost: 0 
        });
      }
    }
  }

  // B. Parse Sessions effectively to estimate cost
  // Example line: group  agent:main:slack...746629  1m ago    google/gemini-3-flash-preview 182k/1049k (17%)
  const sessionLines = sessionsOutput.split('\n');
  for (const line of sessionLines) {
    const tokensMatch = line.match(/(\d+)k\/\d+k/); // Matches "182k/1049k"
    if (tokensMatch) {
      const tokens = parseInt(tokensMatch[1]);
      const agentIdMatch = line.match(/agent:([^:]+):/);
      if (agentIdMatch) {
        const agentId = agentIdMatch[1];
        if (agentsMap.has(agentId)) {
          const agent = agentsMap.get(agentId);
          agent.tokenCount += tokens;
        }
      }
    }
  }

  // C. Final Formatting - convert tokens to estimated cost
  // Roughly $0.075 per 1M tokens for Gemini 3 Flash and similar
  const agents = Array.from(agentsMap.values()).map(agent => {
    return {
      ...agent,
      cost: (agent.tokenCount * 1000) * (0.000000075) // Rough estimate
    };
  });
  
  return agents;
}
