"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Mock financial data
const stocks = [
  { symbol: "AAPL", price: 182.31, change: 1.25 },
  { symbol: "MSFT", price: 402.12, change: -0.45 },
  { symbol: "GOOGL", price: 142.10, change: 0.10 },
  { symbol: "TSLA", price: 191.20, change: -2.31 },
];

export function StockTickers() {
  return (
    <Card className="col-span-1 shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Market Watch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mt-2">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-bold leading-none text-foreground">{stock.symbol}</p>
                <p className="text-xs text-muted-foreground mt-1">${stock.price.toFixed(2)}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono font-medium px-2 py-1 rounded ${stock.change > 0 ? 'text-green-500 bg-green-500/10' : stock.change < 0 ? 'text-red-500 bg-red-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                {stock.change > 0 ? <TrendingUp className="h-3 w-3" /> : stock.change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
