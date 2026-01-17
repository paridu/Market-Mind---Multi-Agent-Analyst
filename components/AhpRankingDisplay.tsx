import React from 'react';
import { AhpStockItem } from '../types';

interface Props {
  data: AhpStockItem[];
  onSelect: (item: AhpStockItem) => void;
}

export const AhpRankingDisplay: React.FC<Props> = ({ data, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#0F1623] border border-slate-800 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
         <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></span>
            AHP_MODEL_OUTPUT: S&P500_TOP30
        </div>
        <div className="text-[9px] font-mono text-slate-500 font-thai">
             W: เติบโต(30) คุ้มค่า(25) โมเมนตัม(25) คุณภาพ(20)
        </div>
      </div>

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F1623] z-10 shadow-sm">
                <tr className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-800">
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 w-1/3">Factor Weighting</th>
                    <th className="p-3 text-right w-16">Select</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
                {data.map((item) => (
                    <tr 
                        key={item.rank}
                        onClick={() => onSelect(item)} 
                        className="group hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                        <td className="p-3 text-center font-bold text-slate-400 group-hover:text-amber-400">
                            {item.rank}
                        </td>
                        <td className="p-3">
                            <div className="font-bold text-slate-200 group-hover:text-amber-400">{item.ticker}</div>
                            <div className="text-[9px] text-slate-500">{item.company}</div>
                        </td>
                        <td className="p-3 text-center">
                            <span className="text-amber-400 font-bold text-sm tabular-nums">{item.ahp_score}</span>
                        </td>
                        <td className="p-3">
                            <div className="flex items-center gap-1 h-full w-full">
                                <div className="flex-1 flex flex-col gap-1">
                                    {/* Mini Bar Chart */}
                                    <div className="flex gap-0.5 h-6 items-end">
                                        <div className="bg-purple-500/80 w-1/4 hover:bg-purple-400 transition-colors" style={{ height: `${item.factors.growth * 10}%` }} title={`การเติบโต: ${item.factors.growth}`}></div>
                                        <div className="bg-emerald-500/80 w-1/4 hover:bg-emerald-400 transition-colors" style={{ height: `${item.factors.value * 10}%` }} title={`ความคุ้มค่า: ${item.factors.value}`}></div>
                                        <div className="bg-blue-500/80 w-1/4 hover:bg-blue-400 transition-colors" style={{ height: `${item.factors.momentum * 10}%` }} title={`โมเมนตัม: ${item.factors.momentum}`}></div>
                                        <div className="bg-slate-400/80 w-1/4 hover:bg-slate-300 transition-colors" style={{ height: `${item.factors.quality * 10}%` }} title={`คุณภาพ: ${item.factors.quality}`}></div>
                                    </div>
                                    <div className="flex justify-between text-[8px] text-slate-600 font-thai">
                                        <span>โต</span><span>คุ้ม</span><span>โม</span><span>ดี</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="p-3 text-right text-slate-600 group-hover:text-amber-400">
                            [ + ]
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};