import React from 'react';
import { PeterLynchResult, LynchCategory, Action } from '../types';

interface Props {
  data: PeterLynchResult;
}

const getCategoryColor = (cat: LynchCategory) => {
  switch (cat) {
    case LynchCategory.FAST_GROWERS: return 'text-purple-400 border-purple-900 bg-purple-900/10';
    case LynchCategory.STALWARTS: return 'text-blue-400 border-blue-900 bg-blue-900/10';
    case LynchCategory.SLOW_GROWERS: return 'text-slate-400 border-slate-800 bg-slate-900/10';
    case LynchCategory.CYCLICALS: return 'text-orange-400 border-orange-900 bg-orange-900/10';
    case LynchCategory.TURNAROUNDS: return 'text-rose-400 border-rose-900 bg-rose-900/10';
    case LynchCategory.ASSET_PLAYS: return 'text-emerald-400 border-emerald-900 bg-emerald-900/10';
    default: return 'text-gray-400';
  }
};

const getActionColor = (action: Action) => {
  switch (action) {
    case Action.BUY: return 'text-terminal-bg bg-emerald-500 border-emerald-600';
    case Action.PASS: return 'text-terminal-bg bg-rose-500 border-rose-600';
    case Action.HOLD: return 'text-terminal-bg bg-yellow-500 border-yellow-600';
    default: return 'text-gray-400';
  }
};

export const LynchDisplay: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#0F1623] border border-slate-800 rounded-sm shadow-sm font-thai p-4">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-900/30 flex items-center justify-center border border-emerald-900 text-emerald-500 text-xs font-bold font-mono">
                  PL
              </div>
              <div>
                  <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide">PETER_LYNCH.AI</h3>
                  <div className="text-[10px] text-slate-500 font-mono">FIDELITY MAGELLAN // GROWTH</div>
              </div>
          </div>
          <div className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-bold font-mono tracking-wide ${getActionColor(data.action)}`}>
              {data.action}
          </div>
      </div>

      <div className="flex justify-between items-center mb-2">
          <div className="text-xl font-bold text-white font-mono">{data.ticker}</div>
          <div className={`text-[10px] uppercase px-2 py-0.5 border rounded-sm font-mono ${getCategoryColor(data.category)}`}>
              {data.category}
          </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 text-xs font-mono bg-slate-900/30 p-2 rounded-sm border border-slate-800/50">
         <span className="text-slate-500 uppercase tracking-tight">TREND:</span>
         <span className="text-slate-300">{data.price_trend}</span>
      </div>

      <div className="mb-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">INVESTMENT THESIS</div>
          <p className="text-sm text-slate-300 leading-relaxed font-thai border-l-2 border-emerald-800 pl-3">
              {data.thesis}
          </p>
      </div>

      <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">DUE DILIGENCE CHECKLIST</div>
          <ul className="space-y-1">
              {data.what_to_check.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-400 font-thai">
                      <span className="text-emerald-500 mt-0.5">▪</span>
                      {item}
                  </li>
              ))}
          </ul>
      </div>

    </div>
  );
};