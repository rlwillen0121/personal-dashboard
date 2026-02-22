"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Loader2 } from "lucide-react";

interface SessionActivity {
  agentId: string;
  agentName: string;
  truncatedKey: string;
  messages: number;
  lastActivity: string;
  kind?: string;
}

export function AgentActivity() {
  const [sessions, setSessions] = useState<SessionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch('/api/agent-activity');
        if (!response.ok) throw new Error('Failed to fetch agent activity');
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && sessions.length === 0) {
    return (
      <Card className="col-span-1 shadow-sm border-border min-h-[300px]">
        <CardContent className="flex items-center justify-center pt-6 h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 shadow-sm border-border flex flex-col min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Agent Activity Log
        </CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4 pb-0">
        {error && (
          <div className="text-[10px] text-red-500 mb-2 font-mono uppercase bg-red-500/5 p-1 rounded inline-block">
            FIX: {error}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto max-h-[200px] custom-scrollbar pr-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight w-[80px]">Agent</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight text-left font-mono w-[140px]">Session</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight text-right w-[70px]">Tokens</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight w-[80px]">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.truncatedKey} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground py-2 text-xs">
                    <span className="truncate block max-w-[70px]">{session.agentName}</span>
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono">
                    <span className="truncate block max-w-[130px]">{session.truncatedKey}</span>
                  </TableCell>
                  <TableCell className="text-right text-foreground py-2 text-[11px] font-mono">
                    {session.messages.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground capitalize">
                    <span>{session.lastActivity}</span>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[10px] text-muted-foreground py-8 italic uppercase font-mono tracking-widest opacity-50">
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
