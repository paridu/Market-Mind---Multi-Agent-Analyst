
import React, { useState, useEffect } from 'react';
import { runLynchAnalysis, runManagerAnalysis, scanMarketTrends, getDimeMarketBrief, scanTechStocks, runAhpRanking, runMatrixAnalysis } from './services/geminiService';
import { AnalysisState, TrendItem, TechStockItem, AhpStockItem, MatrixItem, PortfolioItem, SavedTechScan } from './types';
import { LynchDisplay } from './components/LynchDisplay';
import { ManagerDisplay } from './components/ManagerDisplay';
import { LoadingCard } from './components/LoadingCard';
import { TechScannerDisplay } from './components/TechScannerDisplay';
import { AhpRankingDisplay } from './components/AhpRankingDisplay';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { PortfolioDisplay } from './components/PortfolioDisplay';
import { P5Background } from './components/P5Background';

const SAMPLE_NEWS = `COM7 รายงานกำไรสุทธิไตรมาส 2/67 ที่ 812 ล้านบาท เพิ่มขึ้น 15.3% YoY สูงกว่าที่ตลาดคาดการณ์ โดยได้รับแรงหนุนจากยอดขาย iPhone และอุปกรณ์เสริมที่เติบโตแข็งแกร่ง รวมถึงการบริหารจัดการต้นทุนที่มีประสิทธิภาพมากขึ้น ผู้บริหารมั่นใจครึ่งปีหลังจะเติบโตต่อเนื่องจากการเปิดตัวสินค้าใหม่และการขยายสาขา Studio7 เพิ่มอีก 20 แห่ง อย่างไรก็ตาม ยังมีความกังวลเรื่องหนี้ครัวเรือนที่อาจกระทบกำลังซื้อในต่างจังหวัด`;

const App: React.FC = () => {
  const [newsText, setNewsText] = useState(SAMPLE_NEWS);
  const [activeTab, setActiveTab] = useState<'brief' | 'scan' | 'tech' | 'ahp' | 'matrix' | 'portfolio'>('brief');
  
  // States
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [savedTechScans, setSavedTechScans] = useState<SavedTechScan[]>([]);
  const [state, setState] = useState<AnalysisState>({
    isLynchLoading: false,
    isManagerLoading: false,
    isScanning: false,
    isBriefLoading: false,
    isTechScanning: false,
    isAhpLoading: false,
    isMatrixLoading: false,
    error: null,
    lynchResult: null,
    managerResult: null,
    trends: null,
    dimeBrief: null,
    techStocks: null,
    ahpRanking: null,
    matrixData: null,
    rpmCount: 0,
    totalRequests: 0,
    apiTier: 'FREE'
  });

  const RPM_LIMIT = state.apiTier === 'PRO' ? 2000 : 15;

  // Persistence
  useEffect(() => {
    const savedState = localStorage.getItem('marketMindState');
    const savedPortfolio = localStorage.getItem('marketMindPortfolio');
    const savedScans = localStorage.getItem('marketMindSavedTechScans');
    const savedTotal = localStorage.getItem('marketMindTotalRequests');
    const savedTier = localStorage.getItem('marketMindApiTier') as 'FREE' | 'PRO';

    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            setState(prev => ({
                ...prev,
                lynchResult: parsed.lynchResult,
                managerResult: parsed.managerResult,
                trends: parsed.trends,
                dimeBrief: parsed.dimeBrief,
                techStocks: parsed.techStocks,
                ahpRanking: parsed.ahpRanking,
                matrixData: parsed.matrixData,
                totalRequests: savedTotal ? parseInt(savedTotal) : 0,
                apiTier: savedTier || 'FREE'
            }));
        } catch (e) { console.error(e); }
    }
    if (savedPortfolio) setPortfolioItems(JSON.parse(savedPortfolio));
    if (savedScans) setSavedTechScans(JSON.parse(savedScans));
  }, []);

  useEffect(() => {
    localStorage.setItem('marketMindTotalRequests', state.totalRequests.toString());
    localStorage.setItem('marketMindApiTier', state.apiTier);
  }, [state.totalRequests, state.apiTier]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({ ...prev, rpmCount: 0 }));
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  const trackApiCall = (count = 1) => {
    setState(prev => ({ 
      ...prev, 
      rpmCount: prev.rpmCount + count,
      totalRequests: prev.totalRequests + count
    }));
  };

  const handleToggleTier = () => setState(prev => ({ ...prev, apiTier: prev.apiTier === 'FREE' ? 'PRO' : 'FREE' }));

  // Handlers
  const handleAnalyze = () => {
    if (!newsText.trim()) return;
    trackApiCall(2);
    setState(prev => ({ ...prev, isLynchLoading: true, isManagerLoading: true, error: null, lynchResult: null, managerResult: null }));
    runLynchAnalysis(newsText).then(r => setState(p => ({ ...p, lynchResult: r, isLynchLoading: false }))).catch(e => setState(p => ({ ...p, isLynchLoading: false, error: "Lynch Failed" })));
    runManagerAnalysis(newsText).then(r => setState(p => ({ ...p, managerResult: r, isManagerLoading: false }))).catch(e => setState(p => ({ ...p, isManagerLoading: false, error: "Manager Failed" })));
  };

  const handleScan = async () => {
    trackApiCall();
    setState(prev => ({ ...prev, isScanning: true, error: null }));
    try {
        const trends = await scanMarketTrends();
        setState(prev => ({ ...prev, isScanning: false, trends }));
    } catch (err) { setState(prev => ({ ...prev, isScanning: false, error: "Scan error" })); }
  };

  const handleGetBrief = async () => {
    trackApiCall();
    setState(prev => ({ ...prev, isBriefLoading: true, error: null }));
    try {
        const brief = await getDimeMarketBrief();
        setState(prev => ({ ...prev, isBriefLoading: false, dimeBrief: brief }));
    } catch (err) { setState(prev => ({ ...prev, isBriefLoading: false, error: "Brief error" })); }
  };

  const handleTechScan = async () => {
    trackApiCall();
    setState(prev => ({ ...prev, isTechScanning: true, error: null }));
    try {
      const stocks = await scanTechStocks();
      setState(prev => ({ ...prev, isTechScanning: false, techStocks: stocks }));
      const newScan: SavedTechScan = { id: Math.random().toString(36).substr(2, 9), name: new Date().toISOString(), timestamp: Date.now(), data: stocks };
      setSavedTechScans(prev => [newScan, ...prev]);
    } catch (err) { setState(prev => ({ ...prev, isTechScanning: false, error: "Tech scan error" })); }
  };

  const handleAhpScan = async () => {
    trackApiCall();
    setState(prev => ({ ...prev, isAhpLoading: true, error: null }));
    try {
      const ranking = await runAhpRanking();
      setState(prev => ({ ...prev, isAhpLoading: false, ahpRanking: ranking }));
    } catch (err) { setState(prev => ({ ...prev, isAhpLoading: false, error: "AHP error" })); }
  };

  const handleMatrixScan = async () => {
    trackApiCall();
    setState(prev => ({ ...prev, isMatrixLoading: true, error: null }));
    try {
        const matrix = await runMatrixAnalysis();
        setState(prev => ({ ...prev, isMatrixLoading: false, matrixData: matrix }));
    } catch (err) { setState(prev => ({ ...prev, isMatrixLoading: false, error: "Matrix error" })); }
  };

  const isGlobalScanning = state.isBriefLoading || state.isScanning || state.isTechScanning || state.isAhpLoading || state.isMatrixLoading;
  const isAnyLoading = state.isLynchLoading || state.isManagerLoading;
  const hasResults = state.lynchResult || state.managerResult || isAnyLoading;

  const rpmPercent = Math.min((state.rpmCount / RPM_LIMIT) * 100, 100);
  const rpmColorClass = rpmPercent > 80 ? 'bg-rose-500' : rpmPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  const RunButton = ({ onClick, label, loading, icon }: { onClick: any, label: string, loading: boolean, icon?: string }) => (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
       <div className="text-4xl animate-bounce">{icon || '🤖'}</div>
       <button
          onClick={onClick}
          disabled={loading}
          className="group relative px-6 py-3 font-mono font-bold text-sm tracking-widest text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 overflow-hidden rounded-sm backdrop-blur-md"
       >
          <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all"></div>
          {loading ? 'EXECUTING COMMAND...' : `[ ${label} ]`}
       </button>
    </div>
  );

  return (
    <div className="h-screen bg-terminal-bg text-slate-300 font-sans selection:bg-cyan-900 selection:text-cyan-100 flex flex-col overflow-hidden relative">
      
      {/* Generative P5 Background */}
      <P5Background isLoading={isGlobalScanning || isAnyLoading} />

      <header className="bg-terminal-panel/80 backdrop-blur-md border-b border-terminal-border h-11 flex-shrink-0 flex items-center justify-between px-6 z-50">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-bold text-slate-100 tracking-tight text-sm uppercase terminal-glow">US Market Terminal</span>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-1"></div>
            <div className="flex items-center bg-slate-900/50 rounded-full border border-slate-800 p-0.5 px-2 gap-2">
                <span className="text-[8px] font-mono text-slate-500 uppercase">TIER:</span>
                <button 
                    onClick={handleToggleTier}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all uppercase font-mono ${state.apiTier === 'PRO' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-700 text-slate-400'}`}
                >
                    {state.apiTier}
                </button>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-4 group cursor-help relative">
                <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 font-mono uppercase leading-none mb-1">Live RPM</span>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div className={`h-full transition-all duration-500 ${rpmColorClass}`} style={{ width: `${rpmPercent}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold tabular-nums ${rpmPercent > 80 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {state.rpmCount}/{RPM_LIMIT}
                        </span>
                    </div>
                </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={() => { handleGetBrief(); handleScan(); }}
                disabled={isGlobalScanning}
                className="flex items-center gap-2 text-[10px] font-mono font-bold bg-slate-800/50 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded transition-colors disabled:opacity-50 border border-slate-700"
            >
                <svg className={`w-3 h-3 ${isGlobalScanning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15" />
                </svg>
                SYNC DATA
            </button>
         </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 z-10">
        <section className="flex-1 flex flex-col min-h-0 border-b border-slate-700 bg-terminal-bg/40 backdrop-blur-sm">
            <div className="bg-terminal-panel/50 border-b border-terminal-border flex overflow-x-auto no-scrollbar shrink-0">
                {[
                    { id: 'brief', label: 'US Brief', icon: '⚡', loading: state.isBriefLoading },
                    { id: 'portfolio', label: 'Holdings', icon: '💼' },
                    { id: 'scan', label: 'US Scanner', icon: '🔍', loading: state.isScanning },
                    { id: 'matrix', label: 'Strategy', icon: '💠', loading: state.isMatrixLoading },
                    { id: 'tech', label: 'Tech Zone', icon: '🎯', loading: state.isTechScanning },
                    { id: 'ahp', label: 'Quant', icon: '🏆', loading: state.isAhpLoading },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-5 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
                        ${activeTab === tab.id 
                            ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40 shadow-[inset_0_-10px_10px_rgba(6,182,212,0.1)]' 
                            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 p-4 overflow-hidden">
                {activeTab === 'brief' && (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        {state.isBriefLoading ? <div className="h-full bg-slate-900/50 border border-slate-800 animate-pulse rounded"></div> : state.dimeBrief ? (
                            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-6 rounded relative max-w-4xl mx-auto mt-8 border-l-4 border-l-lime-500 shadow-2xl">
                                <h4 className="text-lime-500 font-mono font-bold text-xs uppercase mb-4 tracking-widest">// US MARKET DIGEST</h4>
                                <div className="text-slate-200 font-thai leading-7 whitespace-pre-line text-sm">{state.dimeBrief}</div>
                            </div>
                        ) : <RunButton onClick={handleGetBrief} label="FETCH_MORNING_DIGEST" loading={state.isBriefLoading} icon="⚡" />}
                    </div>
                )}
                
                {activeTab === 'portfolio' && <PortfolioDisplay items={portfolioItems} onAdd={(i) => setPortfolioItems(p => [...p, {...i, id: Math.random().toString(36).substr(2, 9)}])} onRemove={(id) => setPortfolioItems(p => p.filter(x => x.id !== id))} />}
                
                {activeTab === 'scan' && (
                    <div className="h-full">
                        {state.isScanning ? <div className="h-full bg-slate-900/50 border border-slate-800 animate-pulse rounded"></div> : (state.trends && state.trends.length > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto h-full p-1 custom-scrollbar">
                                {state.trends.map((item, i) => (
                                    <div key={i} onClick={() => setNewsText(`${item.company} (${item.ticker})\n${item.catalyst}`)} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 hover:border-purple-500 cursor-pointer group rounded transition-all shadow-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-100 font-mono text-lg group-hover:text-purple-400">{item.ticker}</span>
                                            <span className="text-[9px] font-mono text-emerald-500 border border-emerald-900/50 px-1">{item.price_trend}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono mb-2 uppercase">{item.sector}</div>
                                        <div className="text-[10px] text-slate-400 font-thai line-clamp-3">{item.catalyst}</div>
                                    </div>
                                ))}
                            </div>
                        ) : <RunButton onClick={handleScan} label="RUN_TREND_SCANNER" loading={state.isScanning} icon="🔍" />}
                    </div>
                )}

                {activeTab === 'matrix' && (
                    <div className="h-full">
                         {state.isMatrixLoading ? <div className="h-full bg-slate-900/50 border border-slate-800 animate-pulse rounded"></div> : state.matrixData ? (
                            <EisenhowerMatrix data={state.matrixData} onSelect={(i) => setNewsText(`Analyzing Selection: ${i.ticker}`)} />
                        ) : <RunButton onClick={handleMatrixScan} label="GENERATE_STRATEGY_MATRIX" loading={state.isMatrixLoading} icon="💠" />}
                    </div>
                )}

                {activeTab === 'tech' && (
                    <div className="h-full">
                        {state.isTechScanning ? <div className="h-full bg-slate-900/50 border border-slate-800 animate-pulse rounded"></div> : (state.techStocks && state.techStocks.length > 0) ? (
                            <TechScannerDisplay data={state.techStocks} onSelect={(i) => setNewsText(`Technical Trade Setup for ${i.ticker}`)} savedScans={savedTechScans} onRename={(id, n) => setSavedTechScans(p => p.map(x => x.id === id ? {...x, name: n} : x))} onLoad={(s) => setState(p => ({...p, techStocks: s.data}))} onDelete={(id) => setSavedTechScans(p => p.filter(x => x.id !== id))} />
                        ) : <RunButton onClick={handleTechScan} label="SCAN_TECH_OPPORTUNITIES" loading={state.isTechScanning} icon="🎯" />}
                    </div>
                )}

                {activeTab === 'ahp' && (
                    <div className="h-full">
                        {state.isAhpLoading ? <div className="h-full bg-slate-900/50 border border-slate-800 animate-pulse rounded"></div> : state.ahpRanking ? (
                            <AhpRankingDisplay data={state.ahpRanking} onSelect={(i) => setNewsText(`Quantitative Rank for ${i.ticker}`)} />
                        ) : <RunButton onClick={handleAhpScan} label="COMPUTE_AHP_RANKING" loading={state.isAhpLoading} icon="🏆" />}
                    </div>
                )}
            </div>
        </section>

        <section className="h-[35vh] flex-shrink-0 bg-terminal-panel/80 backdrop-blur-lg border-t border-slate-800 flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/3 border-r border-slate-800 flex flex-col">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest font-mono">// AGENT_COMMAND</span>
                </div>
                <textarea
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    className="flex-1 bg-transparent text-emerald-400 font-thai text-sm p-4 focus:bg-slate-950/20 outline-none resize-none font-mono leading-relaxed"
                />
                <div className="p-3 bg-slate-900/50">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnyLoading || !newsText.trim()}
                        className={`w-full py-2.5 rounded font-bold text-xs font-mono uppercase border transition-all ${isAnyLoading ? 'bg-slate-800 text-slate-600' : 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]'}`}
                    >
                        {isAnyLoading ? 'Processing Intelligence...' : '[ Execute Analysis ]'}
                    </button>
                </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col bg-transparent overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80">
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">// ANALYSIS_OUTPUT_LOG</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {!hasResults ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <div className="text-[40px] font-mono animate-pulse">_</div>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                             <div className="overflow-hidden border border-slate-800 rounded bg-slate-900/40 backdrop-blur-md">
                                {state.isLynchLoading ? <LoadingCard type="lynch" /> : state.lynchResult && <LynchDisplay data={state.lynchResult} />}
                             </div>
                             <div className="overflow-hidden border border-slate-800 rounded bg-slate-900/40 backdrop-blur-md">
                                {state.isManagerLoading ? <LoadingCard type="manager" /> : state.managerResult && <ManagerDisplay data={state.managerResult} />}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default App;
