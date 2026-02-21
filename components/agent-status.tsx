"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Circle, Loader2 } from "lucide-react";

interface Agent {
  name: string;
  status: string;
  cost: number;
  role?: string;
  active: string;
}

export function AgentStatus() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error('Failed to fetch agent status');
        const data = await response.json();
        setAgents(data.agents || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const totalCost = agents.reduce((acc, agent) => acc + (agent.cost || 0), 0);

  if (loading && agents.length === 0) {
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
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Agent Swarm Status</CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4 pb-0">
        <div className="text-2xl font-bold mb-4 text-foreground shrink-0 leading-none">
          ${totalCost.toFixed(2)} <span className="text-sm font-normal text-muted-foreground ml-1">total usage</span>
        </div>
        {error && <div className="text-[10px] text-red-500 mb-2 font-mono uppercase bg-red-500/5 p-1 rounded inline-block">FIX: {error}</div>}
        
        <div className="flex-1 overflow-y-auto max-h-[180px] custom-scrollbar pr-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight">Agent</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight">Status</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase tracking-tight text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.name} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground py-2 text-xs">
                    <span className="truncate block max-w-[80px]">{agent.name}</span>
                    {agent.role && <span className="block text-[9px] text-muted-foreground font-normal truncate max-w-[80px]">{agent.role}</span>}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5 min-w-[60px]">
                      <Circle className={`h-1.5 w-1.5 fill-current shrink-0 ${agent.active.includes('now') || agent.status === 'OK' ? 'text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'text-slate-600'}`} />
                      <span className="text-[10px] text-muted-foreground capitalize truncate">{agent.active || agent.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-foreground py-2 text-[11px] font-mono">${(agent.cost || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-[10px] text-muted-foreground py-8 italic uppercase font-mono tracking-widest opacity-50">Discovery_Pending</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
