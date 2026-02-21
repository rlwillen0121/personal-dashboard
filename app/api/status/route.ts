import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache agent status for 30 seconds to speed up dashboard refreshes
let statusCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL = 30000; 

export async function GET() {
  try {
    const now = Date.now();
    if (statusCache && (now - statusCache.timestamp < CACHE_TTL)) {
      return NextResponse.json(statusCache.data);
    }

    // 1. Get detailed agent list and bootstrap status
    const { stdout: statusAll } = await execAsync('openclaw status --all --plain');
    
    // Parse the base agent list
    const initialAgents = parseAgentList(statusAll);

    // 2. Fetch all session usages in parallel
    const agentData = await Promise.all(
      initialAgents.map(async (agent) => {
        try {
          const { stdout: sessionsOutput } = await execAsync(`openclaw sessions list --agent ${agent.id} --limit 50 --active-minutes 10000 --kinds group,direct`);
          
          let totalTokens = 0;
          const sessionLines = sessionsOutput.split('\n');
          for (const line of sessionLines) {
            const tokensMatch = line.match(/(\d+)k\/\d+k/);
            if (tokensMatch) {
              totalTokens += parseInt(tokensMatch[1]);
            }
          }
          
          return {
            ...agent,
            cost: (totalTokens * 1000) * (0.000000075) // Rough estimate
          };
        } catch (e) {
          console.warn(`Could not fetch sessions for agent ${agent.id}`, e);
          return agent;
        }
      })
    );

    const responseData = {
      agents: agentData,
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
