import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Execute openclaw status commands
    // Note: We use --plain if available for easier parsing, but the task asked to draft a parser for table output.
    // The CLI output we saw uses box-drawing characters.
    const { stdout: statusAll } = await execAsync('openclaw status --all');
    
    const agents = parseAgentsTable(statusAll);

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

function parseAgentsTable(output: string) {
  const agents: any[] = [];
  const lines = output.split('\n');
  
  // Find the Agents table section
  let inAgentsTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('Agents') && !line.includes('sessions')) {
        // This is the header of the section
    }

    if (line.includes('Agent') && line.includes('Bootstrap') && line.includes('Sessions')) {
      inAgentsTable = true;
      continue;
    }

    if (inAgentsTable) {
      if (line.startsWith('└') || line.trim() === '') {
        if (agents.length > 0) inAgentsTable = false;
        continue;
      }

      if (line.startsWith('├')) continue;

      // Parse table row
      // Example: │ main (Assistant)        │ OK        │       29 │ just now │ ~/.openclaw/agents/main/sessions/sessions.json          │
      const parts = line.split('│').map(p => p.trim()).filter(p => p !== '');
      if (parts.length >= 4) {
        const nameMatch = parts[0].match(/^([^(]+)(?:\(([^)]+)\))?$/);
        agents.push({
          name: nameMatch ? nameMatch[1].trim() : parts[0],
          role: nameMatch && nameMatch[2] ? nameMatch[2].trim() : '',
          status: parts[1],
          sessions: parseInt(parts[2], 10) || 0,
          active: parts[3],
          // We don't have cost in --all, normally it might be in --usage if provider supports it
          cost: 0 
        });
      }
    }
  }
  
  return agents;
}
