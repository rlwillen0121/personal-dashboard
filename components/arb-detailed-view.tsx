'use client';

import React, { useState, useEffect } from 'react';

interface ArbEntry {
  id?: string;
  timestamp: string;
  market: string;
  outcome: string;
  odds: number;
  return_pct?: number;
  status?: string;
  [key: string]: any;
}

interface SimStats {
  totalStake: number;
  totalReturn: number;
  totalProfit: number;
  roi: number;
  count: number;
}

interface ArbDetailedViewProps {
  initialEntries?: ArbEntry[];
}

export function ArbDetailedView({ initialEntries = [] }: ArbDetailedViewProps) {
  const [entries, setEntries] = useState<ArbEntry[]>(initialEntries);
  const [stats, setStats] = useState<SimStats | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [simulating, setSimulating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/arb-ledger');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/simulate-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markAsPlaced = async (entry: ArbEntry) => {
    const key = entry.id || entry.timestamp;
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/arb-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: entry.id,
          timestamp: entry.timestamp,
          action: 'mark_placed'
        }),
      });

      if (response.ok) {
        setEntries(prev => prev.map(e => {
          if ((entry.id && e.id === entry.id) || (e.timestamp === entry.timestamp)) {
            return { ...e, status: 'placed' };
          }
          return e;
        }));
      }
    } catch (error) {
      console.error('Error marking as placed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const simulateTrade = async (entry: ArbEntry) => {
    const key = entry.id || entry.timestamp;
    setSimulating(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/simulate-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arb: entry,
          stake: 100 // Default stake for simulation
        }),
      });

      if (response.ok) {
        fetchStats();
      }
    } catch (error) {
      console.error('Error simulating trade:', error);
    } finally {
      setSimulating(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6 p-4">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm">
          <div className="col-span-full mb-2">
            <h3 className="text-indigo-900 dark:text-indigo-100 font-bold text-lg flex items-center">
              <span className="mr-2">📈</span> Simulation Performance
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-950">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Total Stake</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalStake.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-950">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Total Profit</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${stats.totalProfit.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-950">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Aggregate ROI</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{stats.roi.toFixed(2)}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-950">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Win Count</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.count}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Arbitrage Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry, idx) => {
            const key = entry.id || entry.timestamp || idx;
            const isPlaced = entry.status === 'placed';
            
            return (
              <div key={key} className="bg-white dark:bg-slate-900 rounded-lg shadow border p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-lg">{entry.market}</span>
                    {isPlaced && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        Placed
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Outcome: <span className="text-slate-900 dark:text-slate-100 font-medium">{entry.outcome}</span></p>
                    <p>Odds: <span className="text-slate-900 dark:text-slate-100 font-medium">{entry.odds}</span></p>
                    <p>Found: {new Date(entry.timestamp).toLocaleString()}</p>
                    {entry.return_pct && (
                      <p>Expected ROI: <span className="text-green-600 font-bold">{entry.return_pct.toFixed(2)}%</span></p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => simulateTrade(entry)}
                    disabled={simulating[key]}
                    className="w-full py-2 px-4 rounded font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {simulating[key] ? 'Simulating...' : 'Simulate This Trade'}
                  </button>
                  <button
                    onClick={() => markAsPlaced(entry)}
                    disabled={isPlaced || loading[key]}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                      isPlaced 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                    }`}
                  >
                    {loading[key] ? 'Processing...' : isPlaced ? 'Placed' : 'Mark as Placed'}
                  </button>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              No arbitrage entries found in ledger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
