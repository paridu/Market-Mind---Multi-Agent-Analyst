import React from 'react';
import { MatrixItem } from '../types';

interface Props {
  data: MatrixItem[];
  onSelect: (item: MatrixItem) => void;
}

export const EisenhowerMatrix: React.FC<Props> = ({ data, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#0F1623] border border-slate-800 rounded-sm overflow-hidden relative">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 z-10">
         <div className="text-[10px] font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-sm"></span>
            DECISION_MATRIX: QUALITY_VS_MOMENTUM
        </div>
      </div>

      <div className="flex-1 relative p-6 select-none overflow-hidden">
        {/* Axis Labels */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono font-bold text-slate-500 tracking-widest text-center whitespace-nowrap">
            FUNDAMENTAL QUALITY (IMPORTANCE) ➔
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-500 tracking-widest text-center whitespace-nowrap">
            TECHNICAL URGENCY (MOMENTUM) ➔
        </div>

        {/* The Grid Container */}
        <div className="w-full h-full border border-slate-700 bg-slate-900/30 relative">
            
            {/* Quadrant Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-600/50 border-l border-dashed border-slate-500"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600/50 border-t border-dashed border-slate-500"></div>

            {/* Quadrant Labels */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-500/50 uppercase">Q2: ACCUMULATE</div>
            <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400/50 uppercase">Q1: BUY NOW</div>
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-600/50 uppercase">Q3: AVOID</div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-yellow-500/50 uppercase">Q4: SPECULATE</div>

            {/* Plot Points */}
            {data.map((item, idx) => (
                <div 
                    key={idx}
                    onClick={() => onSelect(item)}
                    className="absolute cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 hover:z-50 transition-all duration-300"
                    style={{
                        left: `${item.urgency}%`,
                        bottom: `${item.importance}%`
                    }}
                >
                    {/* The Dot */}
                    <div className={`w-3 h-3 rounded-full border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all group-hover:scale-150
                        ${item.action === 'Buy Now' ? 'bg-cyan-500 border-white' : 
                          item.action === 'Watchlist' ? 'bg-emerald-500 border-emerald-300' :
                          item.action === 'Speculate' ? 'bg-yellow-500 border-yellow-300' : 'bg-slate-600 border-slate-400'
                        }
                    `}></div>
                    
                    {/* The Label */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-70 group-hover:opacity-100 bg-slate-950/80 px-2 py-1 rounded border border-slate-700 pointer-events-none z-20">
                        <div className="text-xs font-bold font-mono text-white">{item.ticker}</div>
                        <div className="text-[9px] text-slate-400 hidden group-hover:block font-mono">Q:{item.importance} | M:{item.urgency}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};