import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const ACCOUNT = 'ryanwillenai@gmail.com';

export async function GET() {
  try {
    // Fetch Calendar events from the shared primary calendar
    const CALENDAR_ID = 'ryan.willen@gmail.com';
    const calCommand = `gog calendar events ${CALENDAR_ID} --max 5 -a ${ACCOUNT} -j --results-only --from today`;
    const { stdout: calOutput } = await execAsync(calCommand);
    let events = [];
    try {
      const rawEvents = JSON.parse(calOutput || '[]');
      events = rawEvents.map((e: any) => ({
        id: e.id,
        date: e.start?.dateTime 
          ? new Date(e.start.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : e.start?.date 
            ? new Date(e.start.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'TBD',
        subject: e.summary || 'No Title'
      }));
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
