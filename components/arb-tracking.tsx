'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ArbLeg {
  team: string;
  odds: number;
  book: string;
}

interface ArbOpportunity {
  timestamp: string;
  sport: string;
  event: string;
  arb_percent: number;
  expected_profit_pct: number;
  leg1: ArbLeg;
  leg2: ArbLeg;
}

export function ArbTracking() {
  const [arbs, setArbs] = useState<ArbOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArbs() {
      try {
        const response = await fetch('/api/arb-ledger');
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        if (Array.isArray(data)) {
          setArbs(data);
          setError(null);
        }
      } catch (error: any) {
        console.error('Failed to fetch Arb data:', error);
        setError(error.message || 'Error connecting to API');
      } finally {
        setLoading(false);
      }
    }

    fetchArbs();
    const interval = setInterval(fetchArbs, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-sm border-border min-h-[300px]">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border flex flex-col min-h-[300px] overflow-hidden">
      <CardHeader className="pb-2 shrink-0 border-b border-border/50 bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Sports Arb Ledger
          </CardTitle>
          <div className="flex gap-2 items-center">
            {error && <span className="text-[9px] text-rose-500 font-mono font-bold uppercase tracking-tighter">Err: {error}</span>}
            <span className="text-[9px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded uppercase">Paper Trading</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4 pb-0">
        <div className="h-full overflow-y-auto pr-1 custom-scrollbar max-h-[220px]">
          <div className="space-y-1 pb-4">
            {arbs.map((arb, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] text-emerald-500 font-bold font-mono uppercase tracking-tighter opacity-80">
                      {arb.sport.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-foreground font-medium truncate">
                      {arb.event}
                    </span>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                    +{arb.expected_profit_pct}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-[10px] bg-muted/30 p-1 rounded border border-border/30">
                    <div className="text-muted-foreground uppercase text-[8px] font-bold truncate">{arb.leg1.book}</div>
                    <div className="flex justify-between items-baseline">
                      <span className="truncate font-medium">{arb.leg1.team}</span>
                      <span className="font-mono font-bold text-blue-500">@{arb.leg1.odds}</span>
                    </div>
                  </div>
                  <div className="text-[10px] bg-muted/30 p-1 rounded border border-border/30">
                    <div className="text-muted-foreground uppercase text-[8px] font-bold truncate">{arb.leg2.book}</div>
                    <div className="flex justify-between items-baseline">
                      <span className="truncate font-medium">{arb.leg2.team}</span>
                      <span className="font-mono font-bold text-blue-500">@{arb.leg2.odds}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[8px] text-muted-foreground/50 font-mono self-end">
                  {new Date(arb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {arbs.length === 0 && (
              <div className="text-center py-10">
                <div className="text-muted-foreground text-xs font-mono uppercase tracking-[0.2em] opacity-30">
                  Scanning_Markets...
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
