import React from 'react';
import { FundManagerResult } from '../types';

interface Props {
  data: FundManagerResult;
}

const getVerdictStyle = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.startsWith('bullish') || lower.includes('bullish')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (lower.startsWith('bearish') || lower.includes('bearish')) return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    if (lower.startsWith('neutral') || lower.includes('neutral')) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-slate-300 border-slate-700 bg-slate-800/50';
};

const getActionBadge = (action: string) => {
    switch(action) {
        case 'Buy': return 'bg-emerald-600 text-white border-emerald-400';
        case 'Sell': return 'bg-rose-600 text-white border-rose-400';
        case 'Hold': return 'bg-yellow-600 text-white border-yellow-400';
        default: return 'bg-slate-700 text-slate-300 border-slate-500';
    }
};

export const ManagerDisplay: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#0F1623] border border-slate-800 rounded-sm shadow-sm font-thai p-4">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center border border-blue-900 text-blue-500 text-xs font-bold font-mono">
                  FM
              </div>
              <div>
                  <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wide">INSTITUTIONAL_PM</h3>
                  <div className="text-[10px] text-slate-500 font-mono">MACRO STRATEGY // RISK MGMT</div>
              </div>
          </div>
          <div className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-bold font-mono tracking-wide ${getActionBadge(data.action)}`}>
              {data.action}
          </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">EXECUTIVE SUMMARY</div>
        <p className="text-sm text-slate-300 leading-relaxed font-thai">
            {data.summary}
        </p>
      </div>

      <div className="mb-4 bg-slate-900/50 p-3 border border-slate-800">
         <div className="text-[10px] font-bold text-blue-500 uppercase font-mono mb-1">MARKET IMPACT</div>
         <p className="text-xs text-slate-400 font-thai">
            {data.market_impact}
         </p>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold text-rose-500 uppercase font-mono mb-1">RISK FACTORS</div>
        <ul className="space-y-1">
            {data.key_risks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-400 font-thai">
                     <span className="text-rose-500 font-bold font-mono">!</span>
                    {risk}
                </li>
            ))}
        </ul>
      </div>

      <div className="border-t border-slate-800 pt-3 mt-auto">
         <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">FINAL VERDICT</div>
         <div className={`p-3 rounded-sm border text-sm font-bold font-thai leading-relaxed ${getVerdictStyle(data.verdict)}`}>
            {data.verdict}
         </div>
      </div>

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-800/50">
             <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">REFERENCES</div>
             <div className="flex flex-col gap-1">
                {data.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:text-blue-400 hover:underline font-mono truncate flex items-center gap-2">
                        <span className="text-slate-600">[{idx + 1}]</span>
                        {source.title || source.uri}
                    </a>
                ))}
             </div>
          </div>
      )}

    </div>
  );
};