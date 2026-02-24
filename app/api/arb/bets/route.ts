import { NextRequest, NextResponse } from 'next/server';
import { getDb, Bet } from '@/lib/arb-db';

// GET: List all bets
export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM bets 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    const bets = stmt.all() as Bet[];
    
    return NextResponse.json(bets);
  } catch (error: any) {
    console.error('Error fetching bets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Place a bet (requires approval workflow)
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { 
      id, 
      event, 
      sport, 
      leg1_book, 
      leg1_team, 
      leg1_odds, 
      leg2_book, 
      leg2_team, 
      leg2_odds, 
      stake,
      status = 'pending'
    } = body;

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

    let result;

    // If id is provided, update existing record
    if (id) {
      const stmt = db.prepare(`
        UPDATE bets 
        SET event = ?, sport = ?, leg1_book = ?, leg1_team = ?, leg1_odds = ?,
            leg2_book = ?, leg2_team = ?, leg2_odds = ?, stake = ?, potential_payout = ?, status = ?
        WHERE id = ?
      `);
      result = stmt.run(
        event, sport, leg1_book, leg1_team, parseFloat(leg1_odds),
        leg2_book, leg2_team, parseFloat(leg2_odds), stakeAmount, potentialPayout, status, id
      );
    } else {
      // Insert new bet
      const stmt = db.prepare(`
        INSERT INTO bets (event, sport, leg1_book, leg1_team, leg1_odds, leg2_book, leg2_team, leg2_odds, stake, potential_payout, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      result = stmt.run(
        event, sport, leg1_book, leg1_team, parseFloat(leg1_odds),
        leg2_book, leg2_team, parseFloat(leg2_odds), stakeAmount, potentialPayout, status
      );
    }

    return NextResponse.json({ 
      success: true, 
      id: (result as any).lastInsertRowid,
      message: 'Bet placed successfully'
    });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}