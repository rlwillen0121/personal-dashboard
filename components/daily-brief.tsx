"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, Loader2 } from "lucide-react";

interface Event {
  id: string;
  date: string;
  subject: string;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
}

export default function DailyBrief() {
  const [data, setData] = useState<{events: Event[], emails: Email[]}>({ events: [], emails: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrief() {
      try {
        const response = await fetch('/api/brief');
        if (!response.ok) throw new Error('Failed to fetch daily brief');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBrief();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2 shadow-sm border-border min-h-[300px]">
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-border flex flex-col min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
        <CardTitle className="text-xl font-bold text-foreground line-clamp-1">Daily Brief</CardTitle>
        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium shrink-0">
          ryanwillenai@gmail.com
        </span>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <div className="grid gap-6 md:grid-cols-2 h-full">
          {/* Upcoming Events */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-4 shrink-0">
              <Calendar className="w-4 h-4" /> Upcoming Events
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3 pb-4">
                {data.events.length > 0 ? data.events.map((event) => (
                  <li key={event.id} className="flex flex-col border-l-2 border-primary pl-3 py-0.5">
                    <span className="text-[10px] font-medium text-primary uppercase tracking-tighter">
                      {event.date}
                    </span>
                    <span className="text-sm text-foreground font-medium break-words">
                      {event.subject}
                    </span>
                  </li>
                )) : (
                  <li className="text-xs text-muted-foreground italic bg-muted/30 p-4 rounded-lg border border-dashed border-border text-center">
                    No upcoming events found in <br/> ryanwillenai@gmail.com
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Recent Emails */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-4 shrink-0">
              <Mail className="w-4 h-4" /> Recent Emails (Unread)
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3 pb-4">
                {data.emails.length > 0 ? data.emails.map((email) => (
                  <li key={email.id} className="flex flex-col group p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {email.from.replace(/"/g, '').split('<')[0].trim() || email.from}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono whitespace-nowrap mt-1 uppercase">
                        {email.date.includes(':') ? email.date.split(' ')[0] : email.date}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {email.subject}
                    </span>
                  </li>
                )) : (
                  <li className="text-xs text-muted-foreground italic bg-muted/30 p-4 rounded-lg border border-dashed border-border text-center">
                    Inbox looks clean!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      {error && (
        <div className="px-6 pb-4 shrink-0">
            <p className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">Error: {error}</p>
        </div>
      )}
    </Card>
  );
}
