import React from 'react';

interface Props {
  type: 'lynch' | 'manager';
}

export const LoadingCard: React.FC<Props> = ({ type }) => {
  const isLynch = type === 'lynch';
  const border = isLynch ? 'border-emerald-900/30' : 'border-blue-900/30';

  return (
    <div className={`bg-[#0F1623] border ${border} rounded-sm p-4 animate-pulse`}>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded bg-slate-800"></div>
        <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-800 rounded-sm"></div>
            <div className="h-2 w-32 bg-slate-900 rounded-sm"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-2 w-full bg-slate-800/50 rounded-sm"></div>
        <div className="h-2 w-5/6 bg-slate-800/50 rounded-sm"></div>
        <div className="h-2 w-4/6 bg-slate-800/50 rounded-sm"></div>
      </div>

      <div className="mt-4 h-16 bg-slate-900/50 border border-slate-800 rounded-sm"></div>
      
      <div className="mt-4 space-y-2">
         <div className="h-2 w-16 bg-slate-800 rounded-sm"></div>
         <div className="h-2 w-full bg-slate-800/50 rounded-sm"></div>
      </div>
    </div>
  );
};