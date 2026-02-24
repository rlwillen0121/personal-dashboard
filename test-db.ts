// Test script for arb database
import fs from 'fs';
import path from 'path';
import getDb, { Bet, Bankroll } from './lib/arb-db';

// Clean up existing database for fresh test
const DB_PATH = path.join(process.cwd(), '..', 'arb.db');
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Deleted existing database for fresh test\n');
}

const db = getDb();

console.log('Testing Arb Database...\n');

// Test 1: Check initial bankroll
console.log('1. Checking initial bankroll...');
const bankrollStmt = db.prepare("SELECT * FROM bankroll ORDER BY updated_at DESC LIMIT 1");
const initialBankroll = bankrollStmt.get() as Bankroll;
console.log(`   Current balance: $${initialBankroll.balance.toFixed(2)}`);
console.log(`   Updated at: ${initialBankroll.updated_at}\n`);

// Test 2: Insert a sample arb opportunity
console.log('2. Inserting sample arb opportunity...');
const sampleBet = {
  event: 'LAL vs GSW',
  sport: 'basketball',
  leg1_book: 'DraftKings',
  leg1_team: 'LAL -1.5',
  leg1_odds: 1.95,
  leg2_book: 'FanDuel',
  leg2_team: 'GSW +1.5',
  leg2_odds: 1.85,
  stake: 100
};

// Calculate potential payout
const stakeAmount = sampleBet.stake;
const potentialPayout = Math.min(
  stakeAmount * sampleBet.leg1_odds,
  stakeAmount * sampleBet.leg2_odds
);

const stmt = db.prepare(`
  INSERT INTO bets (event, sport, leg1_book, leg1_team, leg1_odds, leg2_book, leg2_team, leg2_odds, stake, potential_payout, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
`);

const result = stmt.run(
  sampleBet.event,
  sampleBet.sport,
  sampleBet.leg1_book,
  sampleBet.leg1_team,
  sampleBet.leg1_odds,
  sampleBet.leg2_book,
  sampleBet.leg2_team,
  sampleBet.leg2_odds,
  stakeAmount,
  potentialPayout
);

console.log(`   Inserted bet with ID: ${result.lastInsertRowid}`);
console.log(`   Event: ${sampleBet.event}\n`);

// Test 3: Verify the bet was inserted
console.log('3. Verifying inserted bet...');
const betStmt = db.prepare('SELECT * FROM bets WHERE id = ?');
const insertedBet = betStmt.get(result.lastInsertRowid) as Bet;
console.log(`   Bet ID: ${insertedBet.id}`);
console.log(`   Event: ${insertedBet.event}`);
console.log(`   Sport: ${insertedBet.sport}`);
console.log(`   Leg 1: ${insertedBet.leg1_book} - ${insertedBet.leg1_team} @ ${insertedBet.leg1_odds}`);
console.log(`   Leg 2: ${insertedBet.leg2_book} - ${insertedBet.leg2_team} @ ${insertedBet.leg2_odds}`);
console.log(`   Stake: $${insertedBet.stake}`);
console.log(`   Status: ${insertedBet.status}\n`);

// Test 4: Update bet status to won
console.log('4. Updating bet status to won...');
const updateStmt = db.prepare("UPDATE bets SET status = ?, result_updated_at = datetime('now') WHERE id = ?");
updateStmt.run('won', result.lastInsertRowid);
console.log('   Bet marked as WON\n');

// Test 5: Update bankroll for winnings
console.log('5. Updating bankroll for winnings...');
const currentStmt = db.prepare("SELECT balance FROM bankroll ORDER BY updated_at DESC LIMIT 1");
const current = currentStmt.get() as { balance: number } | undefined;
const currentBalance = current?.balance || 1000;
const winnings = insertedBet.potential_payout; // Use potential payout from the bet
const newBalance = currentBalance + winnings;

console.log(`   Previous balance: $${currentBalance.toFixed(2)}`);
console.log(`   Winnings: $${winnings.toFixed(2)}`);
console.log(`   New balance: $${newBalance.toFixed(2)}`);

const insertStmt = db.prepare('INSERT INTO bankroll (balance) VALUES (?)');
insertStmt.run(newBalance);
console.log('   Bankroll updated successfully\n');

// Test 6: Final state
console.log('6. Final state summary...');
console.log('\nAll bets:');
const allBetsStmt = db.prepare('SELECT * FROM bets ORDER BY id DESC LIMIT 10');
const allBets = allBetsStmt.all() as Bet[];
allBets.forEach(bet => {
  console.log(`   - [${bet.id}] ${bet.event} (${bet.status})`);
});

console.log('\nBankroll history:');
const bankrollHistoryStmt = db.prepare('SELECT * FROM bankroll ORDER BY id DESC LIMIT 5');
const bankrollHistory = bankrollHistoryStmt.all() as Bankroll[];
bankrollHistory.forEach((br, i) => {
  console.log(`   - Entry ${i+1}: $${br.balance.toFixed(2)} at ${br.updated_at}`);
});

console.log('\n✅ Database test completed successfully!');
