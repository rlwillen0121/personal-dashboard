import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SIM_LEDGER_FILE = path.join(process.cwd(), '..', 'simulated_portfolio.jsonl');

export async function GET() {
  try {
    if (!fs.existsSync(SIM_LEDGER_FILE)) {
      return NextResponse.json({
        totalStake: 0,
        totalReturn: 0,
        totalProfit: 0,
        roi: 0,
        count: 0
      });
    }

    const data = fs.readFileSync(SIM_LEDGER_FILE, 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);
    
    let totalStake = 0;
    let totalReturn = 0;
    let count = 0;

    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        totalStake += entry.stake || 0;
        totalReturn += entry.guaranteed_return || 0;
        count++;
      } catch (e) {
        // Skip invalid lines
      }
    });

    const totalProfit = totalReturn - totalStake;
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    return NextResponse.json({
      totalStake,
      totalReturn,
      totalProfit,
      roi: parseFloat(roi.toFixed(2)),
      count
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
