"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Circle } from "lucide-react";

// In a real implementation, this would be fetched from an API endpoint 
// that runs `openclaw status --usage` and aggregates it.
const agents = [
  { name: "main", status: "active", cost: 0.12, memory: "0.5 GB" },
  { name: "coder", status: "idle", cost: 0.45, memory: "1.2 GB" },
  { name: "researcher", status: "idle", cost: 0.08, memory: "0.8 GB" },
  { name: "tester", status: "active", cost: 0.05, memory: "0.4 GB" },
];

export function AgentStatus() {
  const totalCost = agents.reduce((acc, agent) => acc + agent.cost, 0);

  return (
    <Card className="col-span-1 shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Agent Swarm Status</CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4 text-foreground">${totalCost.toFixed(2)} <span className="text-sm font-normal text-muted-foreground ml-1">total usage</span></div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="h-8 text-xs">Agent</TableHead>
              <TableHead className="h-8 text-xs">Status</TableHead>
              <TableHead className="h-8 text-xs text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.name} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground py-2 text-sm">{agent.name}</TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-2 w-2 fill-current ${agent.status === 'active' ? 'text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'text-slate-600'}`} />
                    <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-foreground py-2 text-sm font-mono">${agent.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
