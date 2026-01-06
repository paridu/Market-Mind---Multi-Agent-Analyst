
import React from 'react';
import { CryptoData } from '../types';

interface Props {
  data: CryptoData[];
  onSelect: (item: CryptoData) => void;
}

export const CryptoDisplay: React.FC<Props> = ({ data, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#0F1623] border border-slate-800 rounded-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-sm animate-pulse"></span>
            CRYPTO_MARKET_MONITOR
        </div>
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0F1623] z-10 shadow-sm">
            <tr className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-800">
              <th className="p-3">Asset</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">24h %</th>
              <th className="p-3 text-right">Market Cap</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
            {data.map((coin) => (
              <tr 
                key={coin.id} 
                onClick={() => onSelect(coin)}
                className="group hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="p-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center border border-slate-700 overflow-hidden">
                    {coin.image ? <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" /> : coin.symbol[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-orange-400">{coin.symbol.toUpperCase()}</div>
                    <div className="text-[9px] text-slate-500">{coin.name}</div>
                  </div>
                </td>
                <td className="p-3 text-right text-slate-200 tabular-nums font-bold">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className={`p-3 text-right tabular-nums ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="p-3 text-right text-slate-500 tabular-nums">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </td>
                <td className="p-3 text-center text-slate-600 group-hover:text-orange-400 font-bold">
                  [ ANALYZE ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
