import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache for 30 seconds
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000;

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
    if (cache && (now - cache.timestamp < CACHE_TTL)) {
      return NextResponse.json(cache.data);
    }

    const { stdout } = await execAsync('openclaw sessions list --active-minutes 1440 --limit 100 --json');
    const parsed = JSON.parse(stdout);

    const sessions = parsed.sessions
      .map((s: any) => ({
        agentId: s.key.split(':')[1],
        agentName: s.key.split(':')[1].replace(/^\w/, (c: string) => c.toUpperCase()),
        sessionKey: s.key,
        truncatedKey: '...' + s.key.slice(-12),
        messages: s.totalTokens || 0,
        lastActivity: formatAge(s.ageMs || 0),
        kind: s.kind,
        model: s.model || '',
        ageMs: s.ageMs || 0,
      }))
      .sort((a: any, b: any) => a.ageMs - b.ageMs);

    const responseData = {
      sessions,
      count: sessions.length,
      timestamp: new Date().toISOString(),
    };

    cache = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching agent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent activity', details: error.message },
      { status: 500 }
    );
  }
}
