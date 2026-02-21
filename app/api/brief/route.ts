import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const ACCOUNT = 'ryanwillenai@gmail.com';

export async function GET() {
  try {
    // Fetch Calendar events
    // Using --from today to ensure we get upcoming events
    const calCommand = `gog calendar list --max 5 -a ${ACCOUNT} -j --results-only --from today`;
    const { stdout: calOutput } = await execAsync(calCommand);
    let events = [];
    try {
      events = JSON.parse(calOutput || '[]');
    } catch (e) {
      console.error('Failed to parse calendar JSON', e);
    }

    // Fetch Emails
    const mailCommand = `gog gmail list "is:unread label:inbox" --max 5 -a ${ACCOUNT} -j --results-only`;
    const { stdout: mailOutput } = await execAsync(mailCommand);
    let emails = [];
    try {
      emails = JSON.parse(mailOutput || '[]');
    } catch (e) {
      console.error('Failed to parse gmail JSON', e);
    }

    return NextResponse.json({
      events: Array.isArray(events) ? events : [],
      emails: Array.isArray(emails) ? emails : [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching brief:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brief data', details: error.message },
      { status: 500 }
    );
  }
}
