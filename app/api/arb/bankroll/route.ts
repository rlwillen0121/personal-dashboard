import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/arb-db';

// GET: Get current bankroll balance
export async function GET() {
  try {
    const db = getDb();
    
    // Get the latest bankroll entry
    const stmt = db.prepare('SELECT * FROM bankroll ORDER BY id DESC LIMIT 1');
    const bankroll = stmt.get() as Bankroll;
    
    if (!bankroll) {
      return NextResponse.json({ 
        error: 'No bankroll data found', 
        balance: 1000 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      balance: bankroll.balance,
      updated_at: bankroll.updated_at
    });
  } catch (error: any) {
    console.error('Error fetching bankroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update bankroll (used when bets are settled)
export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { amount, reason, betId } = body;

    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required field: amount' }, { status: 400 });
    }

    // Get current balance
    const currentStmt = db.prepare("SELECT balance FROM bankroll ORDER BY id DESC LIMIT 1");
    const current = currentStmt.get() as { balance: number } | undefined;
    
    const currentBalance = current?.balance || 1000;
    const newBalance = currentBalance + parseFloat(amount);

    // Insert new bankroll entry
    const insertStmt = db.prepare("INSERT INTO bankroll (balance) VALUES (?)");
    insertStmt.run(newBalance);

    // Update any related bet
    if (betId) {
      const updateStmt = db.prepare("UPDATE bets SET result_updated_at = datetime('now') WHERE id = ?");
      updateStmt.run(betId);
    }

    return NextResponse.json({
      success: true,
      previousBalance: currentBalance,
      adjustment: parseFloat(amount),
      newBalance,
      reason: reason || 'Bankroll adjustment',
      updated_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating bankroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}