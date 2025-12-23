import React, { useState, useMemo } from 'react';
import { TechStockItem } from '../types';

interface Props {
  data: TechStockItem[];
  onSelect: (item: TechStockItem) => void;
}

type SortKey = keyof TechStockItem;

export const TechScannerDisplay: React.FC<Props> = ({ data, onSelect }) => {
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => 
      item.ticker.toLowerCase().includes(filterText.toLowerCase()) ||
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Custom parsing for numbers
        if (sortConfig.key === 'upside' || sortConfig.key === 'current_price') {
             const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
             const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
             if (!isNaN(aNum) && !isNaN(bNum)) {
                 return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
             }
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filterText, sortConfig]);

  return (
    <div className="flex flex-col h-full bg-[#0F1623] border border-slate-800 rounded-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-sm"></span>
            SCAN_RESULTS: TECH_SECTOR_1Q
        </div>
        <div className="relative">
            <input 
                type="text" 
                placeholder="FILTER TICKER..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-[#05080F] border border-slate-700 rounded-sm py-1 px-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 w-32 placeholder-slate-700 uppercase"
            />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F1623] z-10 shadow-sm">
                <tr className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-800">
                    <th className="p-3 cursor-pointer hover:text-slate-300" onClick={() => handleSort('ticker')}>Ticker</th>
                    <th className="p-3 text-right cursor-pointer hover:text-slate-300" onClick={() => handleSort('current_price')}>Last Price</th>
                    <th className="p-3 text-right">Sup (Buy)</th>
                    <th className="p-3 text-right">Res (Sell)</th>
                    <th className="p-3 text-right">Target 1Q</th>
                    <th className="p-3 text-right cursor-pointer hover:text-slate-300" onClick={() => handleSort('upside')}>Upside %</th>
                    <th className="p-3 text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
                {processedData.map((item, idx) => (
                    <tr 
                        key={idx} 
                        onClick={() => onSelect(item)}
                        className="group hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-mono"
                    >
                        <td className="p-3">
                            <div className="font-bold text-cyan-400 group-hover:text-cyan-300">{item.ticker}</div>
                            <div className="text-[9px] text-slate-500 truncate max-w-[120px]">{item.name}</div>
                        </td>
                        <td className="p-3 text-right text-slate-300 tabular-nums font-bold">{item.current_price}</td>
                        <td className="p-3 text-right text-emerald-500 tabular-nums">{item.support_level}</td>
                        <td className="p-3 text-right text-rose-500 tabular-nums">{item.resistance_level}</td>
                        <td className="p-3 text-right text-slate-300 tabular-nums">{item.target_1q}</td>
                        <td className="p-3 text-right">
                             <span className="text-emerald-400 tabular-nums font-bold bg-emerald-950/30 px-1 py-0.5 rounded-sm border border-emerald-900/50">
                                {item.upside}
                            </span>
                        </td>
                        <td className="p-3 text-center text-slate-600 group-hover:text-cyan-500">
                             »
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};