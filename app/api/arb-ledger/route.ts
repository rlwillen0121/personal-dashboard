import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path to the arbitrage ledger file in the workspace root
const LEDGER_FILE = path.join(process.cwd(), '..', 'arb_ledger.jsonl');

export async function GET() {
  try {
    try {
      const data = await fs.readFile(LEDGER_FILE, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.length > 0);
      const logEntries = lines.map(line => JSON.parse(line));
      
      // Return the last 10 entries, reversed so newest is first
      const recentArbs = logEntries.slice(-10).reverse();
      
      return NextResponse.json(recentArbs);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return NextResponse.json([]); // Return empty array if file doesn't exist yet
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error reading arb ledger:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, odds, bookmakers, stake, potential_payout, note } = body;

    if (!event || !odds || !bookmakers || !stake) {
      return NextResponse.json({ error: 'Missing required fields: event, odds, bookmakers, stake' }, { status: 400 });
    }

    const entry = {
      type: 'arb_opportunity',
      event,
      odds: Array.isArray(odds) ? odds : [odds],
      bookmakers: Array.isArray(bookmakers) ? bookmakers : [bookmakers],
      stake: parseFloat(stake),
      potential_payout: potential_payout ? parseFloat(potential_payout) : parseFloat(stake) * 1.1, // Default 10% return
      timestamp: new Date().toISOString(),
      note: note || 'Arbitrage opportunity logged'
    };

    // Append to the ledger file
    await fs.appendFile(LEDGER_FILE, JSON.stringify(entry) + '\n');

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error writing arb ledger:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
