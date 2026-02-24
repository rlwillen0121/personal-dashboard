import Database from 'better-sqlite3';
import path from 'path';

// Database path - using workspace root for consistency
const DB_PATH = path.join(process.cwd(), '..', 'arb.db');

// Initialize database and create tables if they don't exist
export function initDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  // Create bets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      sport TEXT NOT NULL,
      leg1_book TEXT NOT NULL,
      leg1_team TEXT NOT NULL,
      leg1_odds REAL NOT NULL,
      leg2_book TEXT NOT NULL,
      leg2_team TEXT NOT NULL,
      leg2_odds REAL NOT NULL,
      stake REAL NOT NULL DEFAULT 0,
      potential_payout REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost')),
      result_updated_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // Create bankroll table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bankroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      balance REAL NOT NULL DEFAULT 1000,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // Check if initial bankroll exists, create if not
  const initialCheck = db.prepare('SELECT COUNT(*) as count FROM bankroll');
  const result = initialCheck.get() as { count: number };
  
  if (result.count === 0) {
    const insert = db.prepare('INSERT INTO bankroll (balance) VALUES (?)');
    insert.run(1000);
  }
  
  return db;
}

// Get database instance
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

// Types for TypeScript
export interface Bet {
  id: number;
  event: string;
  sport: string;
  leg1_book: string;
  leg1_team: string;
  leg1_odds: number;
  leg2_book: string;
  leg2_team: string;
  leg2_odds: number;
  stake: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost';
  result_updated_at: string | null;
  created_at: string;
}

export interface Bankroll {
  id: number;
  balance: number;
  updated_at: string;
}

export default getDb;