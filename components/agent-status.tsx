"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Circle, DollarSign } from "lucide-react";

const agents = [
  { name: "coder", status: "idle", cost: 0.12, tasks: 5 },
  { name: "researcher", status: "active", cost: 0.45, tasks: 12 },
  { name: "writer", status: "idle", cost: 0.08, tasks: 3 },
];

export function AgentStatus() {
  const totalCost = agents.reduce((acc, agent) => acc + agent.cost, 0);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agent Status & Costs</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">${totalCost.toFixed(2)} total cost</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.name}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Circle className={`h-2 w-2 fill-current ${agent.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="capitalize">{agent.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">${agent.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
