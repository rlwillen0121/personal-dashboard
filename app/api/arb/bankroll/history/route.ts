import { NextResponse } from 'next/server';
import { getDb } from '@/lib/arb-db';
import { Bankroll } from '@/lib/arb-db';

// GET: Get bankroll history (all entries)
export async function GET() {
  try {
    const db = getDb();
    
    // Get all bankroll entries ordered by updated_at ascending
    const stmt = db.prepare('SELECT * FROM bankroll ORDER BY updated_at ASC');
    const history = stmt.all() as Bankroll[];
    
    if (!history || history.length === 0) {
      return NextResponse.json({ 
        error: 'No bankroll history found', 
        history: [] 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      history
    });
  } catch (error: any) {
    console.error('Error fetching bankroll history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}