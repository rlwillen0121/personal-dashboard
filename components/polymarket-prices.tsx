'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Market {
  id: string;
  question: string;
  yesChance: number | null;
  category: string;
}

export function PolymarketPrices() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch('/api/polymarket');
        const data = await response.json();
        if (Array.isArray(data)) {
          setMarkets(data);
        }
      } catch (error) {
        console.error('Failed to fetch Polymarket data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // Update every minute
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
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Polymarket Trends
          </CardTitle>
          <span className="text-[9px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded uppercase">Live</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4 pb-0">
        <div className="h-full overflow-y-auto pr-1 custom-scrollbar max-h-[220px]">
          <div className="space-y-1 pb-4">
            {markets.map((market) => (
              <div 
                key={market.id} 
                className="group flex justify-between items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] text-blue-500 font-bold font-mono uppercase mb-1 tracking-tighter opacity-80">
                    {market.category || 'General'}
                  </span>
                  <span className="text-xs text-foreground font-medium leading-normal break-words line-clamp-2 group-hover:line-clamp-none transition-all">
                    {market.question}
                  </span>
                </div>
                <div className="flex flex-col items-end shrink-0 pt-1">
                  <div className={`p-1.5 rounded-md flex items-center justify-center min-w-[42px] ${
                    market.yesChance !== null 
                      ? market.yesChance > 50 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className="text-xs font-mono font-black italic tracking-tighter">
                        {market.yesChance !== null ? `${Math.round(market.yesChance)}%` : '--'}
                    </span>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-bold font-mono uppercase mt-1 tracking-widest">
                    YES
                  </span>
                </div>
              </div>
            ))}
            {markets.length === 0 && (
              <div className="text-center py-10">
                <div className="text-muted-foreground text-xs font-mono uppercase tracking-[0.2em] opacity-30">
                  No_Markets_Active
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
