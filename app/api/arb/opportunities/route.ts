import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/arb-db';

// GET: List all bankroll history
// POST: Create a new arb opportunity (researcher reports)
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { event, sport, leg1_book, leg1_team, leg1_odds, leg2_book, leg2_team, leg2_odds, stake } = body;

    // Validate required fields
    if (!event || !sport || !leg1_book || !leg1_team || !leg1_odds || 
        !leg2_book || !leg2_team || !leg2_odds) {
      return NextResponse.json({ 
        error: 'Missing required fields: event, sport, leg1_book, leg1_team, leg1_odds, leg2_book, leg2_team, leg2_odds' 
      }, { status: 400 });
    }

    // Calculate potential payout
    const stakeAmount = parseFloat(stake) || 100;
    const potentialPayout = Math.min(
      stakeAmount * parseFloat(leg1_odds),
      stakeAmount * parseFloat(leg2_odds)
    );

    // Insert the arb opportunity
    const stmt = db.prepare(`
      INSERT INTO bets (event, sport, leg1_book, leg1_team, leg1_odds, leg2_book, leg2_team, leg2_odds, stake, potential_payout, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    
    const result = stmt.run(
      event,
      sport,
      leg1_book,
      leg1_team,
      parseFloat(leg1_odds),
      leg2_book,
      leg2_team,
      parseFloat(leg2_odds),
      stakeAmount,
      potentialPayout
    );

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid as number,
      message: 'Arb opportunity reported successfully. Awaiting approval in #dev-ops channel.'
    });
  } catch (error: any) {
    console.error('Error reporting arb opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM bets ORDER BY created_at DESC LIMIT 50');
    const bets = stmt.all() as Bet[];
    
    return NextResponse.json(bets);
  } catch (error: any) {
    console.error('Error fetching arb opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}