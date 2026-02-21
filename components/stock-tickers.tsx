"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const stocks = [
  { symbol: "AAPL", price: 182.31, change: 1.25 },
  { symbol: "MSFT", price: 402.12, change: -0.45 },
  { symbol: "GOOGL", price: 142.10, change: 0.10 },
  { symbol: "TSLA", price: 191.20, change: -2.31 },
];

export function StockTickers() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Market Tickers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium leading-none">{stock.symbol}</p>
                <p className="text-sm text-muted-foreground">${stock.price.toFixed(2)}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stock.change > 0 ? 'text-green-500' : stock.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {stock.change > 0 ? <TrendingUp className="h-4 w-4" /> : stock.change < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
