import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // 1. Get detailed agent list and bootstrap status
    const { stdout: statusAll } = await execAsync('openclaw status --all');
    
    const agents = await getAgentUsage(statusAll);

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

async function getAgentUsage(statusOutput: string) {
  const agents: any[] = [];
  const statusLines = statusOutput.split('\n');
  
  // A. Parse Agent list from table
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
        const agentName = nameMatch ? nameMatch[1].trim().toLowerCase() : parts[0].toLowerCase();
        
        agents.push({
          id: agentName,
          name: nameMatch ? nameMatch[1].trim() : parts[0],
          role: nameMatch && nameMatch[2] ? nameMatch[2].trim() : '',
          status: parts[1],
          sessionsCount: parseInt(parts[2], 10) || 0,
          active: parts[3],
          cost: 0 
        });
      }
    }
  }

  // B. For each agent, fetch their specific session totals to calculate cost
  for (let agent of agents) {
    try {
      const { stdout: sessionsOutput } = await execAsync(`openclaw sessions list --agent ${agent.id} --limit 100 --active-minutes 10000 --kinds group,direct`);
      
      let totalTokens = 0;
      const sessionLines = sessionsOutput.split('\n');
      for (const line of sessionLines) {
        const tokensMatch = line.match(/(\d+)k\/\d+k/);
        if (tokensMatch) {
          totalTokens += parseInt(tokensMatch[1]);
        }
      }
      
      // Cost Estimate ($0.075 per 1M tokens)
      agent.cost = (totalTokens * 1000) * (0.000000075);
    } catch (e) {
      console.warn(`Could not fetch sessions for agent ${agent.id}`, e);
    }
  }
  
  return agents;
}
