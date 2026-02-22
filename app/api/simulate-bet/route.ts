import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Using workspace root for persistence as requested
// Defaulting to .openclaw/workspace-coder/simulated_portfolio.jsonl if possible, 
// but since the server runs in dashboard-v2, we need to go up if necessary.
// The instructions said "workspace root". In OpenClaw, process.cwd() is often dashboard-v2 if running there.
// However, the existing LEDGER_FILE uses process.cwd() which is dashboard-v2.
// I'll stick to the requested file name in the project root (where arb_paper_ledger.jsonl is).

const SIM_LEDGER_FILE = path.join(process.cwd(), '..', 'simulated_portfolio.jsonl');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { arb, stake } = body;

    if (!arb || !stake) {
      return NextResponse.json({ error: 'Missing arb details or stake' }, { status: 400 });
    }

    const entry = {
      timestamp: new Date().toISOString(),
      stake: parseFloat(stake),
      arb,
      // Calculate guaranteed return based on stake and arb return percentage
      // Assuming return_pct is available in arb (e.g. 2.5 for 2.5%)
      guaranteed_return: parseFloat(stake) * (1 + (arb.return_pct || 0) / 100)
    };

    fs.appendFileSync(SIM_LEDGER_FILE, JSON.stringify(entry) + '\n');

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Simulation API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
