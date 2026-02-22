"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Circle, Loader2, BarChart3 } from "lucide-react";

interface ModelUsage {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost: number;
}

interface Agent {
  id: string;
  name: string;
  status: string;
  cost: number;
  role?: string;
  active: string;
  tokenCount?: number;
  modelUsage?: ModelUsage[];
}

export function AgentStatus() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openRouterSummary, setOpenRouterSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error('Failed to fetch agent status');
        const data = await response.json();
        setAgents(data.agents || []);
        setOpenRouterSummary(data.openRouterSummary || null);
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

  // Calculate model usage summary across all agents
  const modelUsageSummary = agents.reduce((acc, agent) => {
    if (agent.modelUsage) {
      agent.modelUsage.forEach((usage) => {
        const model = usage.model;
        if (!acc[model]) {
          acc[model] = {
            model: model,
            prompt_tokens: 0,
            completion_tokens: 0,
            cost: 0
          };
        }
        acc[model].prompt_tokens += usage.prompt_tokens || 0;
        acc[model].completion_tokens += usage.completion_tokens || 0;
        acc[model].cost += usage.cost || 0;
      });
    }
    return acc;
  }, {} as Record<string, { model: string; prompt_tokens: number; completion_tokens: number; cost: number }>);

  const modelUsageList = Object.values(modelUsageSummary).sort((a, b) => b.cost - a.cost);

  // Calculate total tokens for percentage calculation
  const totalTokens = modelUsageList.reduce((sum, m) => sum + m.prompt_tokens + m.completion_tokens, 0);
  const totalModelCost = modelUsageList.reduce((sum, m) => sum + m.cost, 0);

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
        <div className="flex items-baseline gap-2 mb-4 shrink-0">
          <div className="text-2xl font-bold text-foreground leading-none">
            ${openRouterSummary?.totalCost?.toFixed(2) || totalCost.toFixed(2)}
          </div>
          <span className="text-sm font-normal text-muted-foreground uppercase tracking-wide">total usage</span>
        </div>
        
        {/* Model Usage Section */}
        {modelUsageList.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              <span>Model Usage</span>
            </div>
            <div className="space-y-2">
              {modelUsageList.slice(0, 5).map((model) => {
                const percentage = totalTokens > 0 ? ((model.prompt_tokens + model.completion_tokens) / totalTokens) * 100 : 0;
                const costPercentage = totalModelCost > 0 ? (model.cost / totalModelCost) * 100 : 0;
                
                return (
                  <div key={model.model} className="group">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-medium text-foreground truncate max-w-[120px]">{model.model.split('/').pop() || model.model}</span>
                      <div className="flex gap-3">
                        <span className="text-muted-foreground">
                          <span className="font-mono">${model.cost.toFixed(4)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          <span className="font-mono">{model.prompt_tokens + model.completion_tokens}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {/* Cost Bar */}
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500/80 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(costPercentage, 100)}%` }}
                        />
                      </div>
                      {/* Tokens Bar */}
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500/80 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                      <span className="text-emerald-500/80 font-medium">${model.cost.toFixed(4)} ({costPercentage.toFixed(1)}%)</span>
                      <span className="text-blue-500/80 font-medium">{model.prompt_tokens + model.completion_tokens} tokens ({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
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
                <TableRow key={agent.id} className="border-border hover:bg-muted/50">
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
