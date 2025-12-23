import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';

interface Props {
  items: PortfolioItem[];
  onAdd: (item: Omit<PortfolioItem, 'id'>) => void;
  onRemove: (id: string) => void;
}

export const PortfolioDisplay: React.FC<Props> = ({ items, onAdd, onRemove }) => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  
  // Simulated Live Prices
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize simulated prices based on avgPrice if not set
    const initialPrices: Record<string, number> = {};
    items.forEach(item => {
        if (!livePrices[item.ticker]) {
            initialPrices[item.ticker] = item.avgPrice; 
        }
    });
    if (Object.keys(initialPrices).length > 0) {
        setLivePrices(prev => ({ ...prev, ...initialPrices }));
    }

    // Simulate Ticker Movement
    const interval = setInterval(() => {
        setLivePrices(prev => {
            const next = { ...prev };
            items.forEach(item => {
                const current = prev[item.ticker] || item.avgPrice;
                // Random walk: -0.5% to +0.5% fluctuation
                const change = current * ((Math.random() - 0.5) / 100); 
                next[item.ticker] = current + change;
            });
            return next;
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker && shares && avgPrice) {
      onAdd({
        ticker: ticker.toUpperCase(),
        shares: Number(shares),
        avgPrice: Number(avgPrice)
      });
      setTicker('');
      setShares('');
      setAvgPrice('');
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (livePrices[item.ticker] || item.avgPrice) * item.shares, 0);
  const totalCost = items.reduce((sum, item) => sum + item.avgPrice * item.shares, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#0F1623] border border-slate-800 rounded-sm overflow-hidden">
        {/* Header Summary */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap justify-between items-center gap-4">
             <div className="text-[10px] font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-sm animate-pulse"></span>
                LIVE_PORTFOLIO_TRACKER
            </div>
            <div className="flex gap-6 font-mono text-sm">
                <div>
                    <span className="text-slate-500 text-[10px] block">TOTAL EQUITY</span>
                    <span className="text-slate-200 font-bold tabular-nums">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                    <span className="text-slate-500 text-[10px] block">TOTAL P/L</span>
                    <span className={`font-bold tabular-nums ${totalPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        ({totalPLPercent.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Holdings Table */}
            <div className="flex-1 overflow-auto custom-scrollbar border-r border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0F1623] z-10 shadow-sm">
                        <tr className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-800">
                            <th className="p-3">Ticker</th>
                            <th className="p-3 text-right">Qty</th>
                            <th className="p-3 text-right">Avg Price</th>
                            <th className="p-3 text-right">Live Price</th>
                            <th className="p-3 text-right">P/L %</th>
                            <th className="p-3 text-center">Act</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
                        {items.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-600 italic">No holdings. Add position below.</td></tr>
                        ) : (
                            items.map(item => {
                                const current = livePrices[item.ticker] || item.avgPrice;
                                const pl = ((current - item.avgPrice) / item.avgPrice) * 100;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-800/30">
                                        <td className="p-3 font-bold text-slate-200">{item.ticker}</td>
                                        <td className="p-3 text-right text-slate-400 tabular-nums">{item.shares}</td>
                                        <td className="p-3 text-right text-slate-400 tabular-nums">{item.avgPrice.toFixed(2)}</td>
                                        <td className="p-3 text-right text-cyan-300 tabular-nums font-bold">{current.toFixed(2)}</td>
                                        <td className={`p-3 text-right tabular-nums ${pl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {pl >= 0 ? '+' : ''}{pl.toFixed(2)}%
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => onRemove(item.id)} className="text-rose-500 hover:text-rose-300">×</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Position Form */}
            <div className="w-full md:w-64 bg-slate-900/30 p-4 flex flex-col gap-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">ADD_POSITION</div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input 
                        className="bg-[#05080F] border border-slate-700 rounded-sm p-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 outline-none uppercase" 
                        placeholder="TICKER (e.g. AAPL)"
                        value={ticker}
                        onChange={e => setTicker(e.target.value)}
                        required
                    />
                    <input 
                        className="bg-[#05080F] border border-slate-700 rounded-sm p-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 outline-none" 
                        placeholder="SHARES (Qty)"
                        type="number"
                        value={shares}
                        onChange={e => setShares(e.target.value)}
                        required
                    />
                    <input 
                        className="bg-[#05080F] border border-slate-700 rounded-sm p-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 outline-none" 
                        placeholder="AVG PRICE ($)"
                        type="number"
                        step="0.01"
                        value={avgPrice}
                        onChange={e => setAvgPrice(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black py-2 rounded-sm text-xs font-bold font-mono uppercase transition-colors">
                        [ EXECUTE_BUY ]
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};