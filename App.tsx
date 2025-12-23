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

const SAMPLE_NEWS = `COM7 รายงานกำไรสุทธิไตรมาส 2/67 ที่ 812 ล้านบาท เพิ่มขึ้น 15.3% YoY สูงกว่าที่ตลาดคาดการณ์ โดยได้รับแรงหนุนจากยอดขาย iPhone และอุปกรณ์เสริมที่เติบโตแข็งแกร่ง รวมถึงการบริหารจัดการต้นทุนที่มีประสิทธิภาพมากขึ้น ผู้บริหารมั่นใจครึ่งปีหลังจะเติบโตต่อเนื่องจากการเปิดตัวสินค้าใหม่และการขยายสาขา Studio7 เพิ่มอีก 20 แห่ง อย่างไรก็ตาม ยังมีความกังวลเรื่องหนี้ครัวเรือนที่อาจกระทบกำลังซื้อในต่างจังหวัด`;

const App: React.FC = () => {
  const [newsText, setNewsText] = useState(SAMPLE_NEWS);
  const [activeTab, setActiveTab] = useState<'brief' | 'scan' | 'tech' | 'ahp' | 'matrix' | 'portfolio'>('brief');
  
  // Portfolio State
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Saved Scans State
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
  });

  // --- Long Memory / Persistence ---
  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('marketMindState');
    const savedPortfolio = localStorage.getItem('marketMindPortfolio');
    const savedScans = localStorage.getItem('marketMindSavedTechScans');

    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            // We only restore result data, not loading states
            setState(prev => ({
                ...prev,
                lynchResult: parsed.lynchResult,
                managerResult: parsed.managerResult,
                trends: parsed.trends,
                dimeBrief: parsed.dimeBrief,
                techStocks: parsed.techStocks,
                ahpRanking: parsed.ahpRanking,
                matrixData: parsed.matrixData,
            }));
        } catch (e) {
            console.error("Failed to restore state", e);
        }
    }

    if (savedPortfolio) {
        try {
            setPortfolioItems(JSON.parse(savedPortfolio));
        } catch (e) {
            console.error("Failed to restore portfolio", e);
        }
    }

    if (savedScans) {
        try {
            setSavedTechScans(JSON.parse(savedScans));
        } catch (e) {
            console.error("Failed to restore saved scans", e);
        }
    }
  }, []);

  // Save data to LocalStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
        lynchResult: state.lynchResult,
        managerResult: state.managerResult,
        trends: state.trends,
        dimeBrief: state.dimeBrief,
        techStocks: state.techStocks,
        ahpRanking: state.ahpRanking,
        matrixData: state.matrixData,
    };
    localStorage.setItem('marketMindState', JSON.stringify(stateToSave));
  }, [state.lynchResult, state.managerResult, state.trends, state.dimeBrief, state.techStocks, state.ahpRanking, state.matrixData]);

  useEffect(() => {
    localStorage.setItem('marketMindPortfolio', JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  useEffect(() => {
    localStorage.setItem('marketMindSavedTechScans', JSON.stringify(savedTechScans));
  }, [savedTechScans]);
  // ---------------------------------

  const isAnyLoading = state.isLynchLoading || state.isManagerLoading;
  const isGlobalScanning = state.isBriefLoading || state.isScanning || state.isTechScanning || state.isAhpLoading || state.isMatrixLoading;
  const hasResults = state.lynchResult || state.managerResult || isAnyLoading;

  // Simultaneous Loading of Market Intelligence
  const handleRefreshAllIntelligence = () => {
    // Fire and forget all requests - individual states will update
    handleGetBrief();
    handleScan();
    handleMatrixScan();
    handleTechScan();
    handleAhpScan();
  };

  // Trigger load on first mount if no data exists
  useEffect(() => {
    if (!state.dimeBrief && !state.trends) {
        // Optional: Auto-load on start. Uncomment if desired.
        // handleRefreshAllIntelligence(); 
    }
  }, []);

  // Handlers
  const handleScan = async () => {
    setState(prev => ({ ...prev, isScanning: true, error: null }));
    try {
        const trends = await scanMarketTrends();
        setState(prev => ({ ...prev, isScanning: false, trends }));
    } catch (err) {
        console.error("Scan error:", err);
        setState(prev => ({ ...prev, isScanning: false, error: "Failed to scan market trends." }));
    }
  };

  const handleGetBrief = async () => {
    setState(prev => ({ ...prev, isBriefLoading: true, error: null }));
    try {
        const brief = await getDimeMarketBrief();
        setState(prev => ({ ...prev, isBriefLoading: false, dimeBrief: brief }));
    } catch (err) {
        console.error("Brief error:", err);
        setState(prev => ({ ...prev, isBriefLoading: false, error: "Failed to get market brief." }));
    }
  };

  const handleTechScan = async () => {
    setState(prev => ({ ...prev, isTechScanning: true, error: null }));
    try {
      const stocks = await scanTechStocks();
      setState(prev => ({ ...prev, isTechScanning: false, techStocks: stocks }));

      // Auto-save the new scan results
      const now = new Date();
      // Format: YYYY-MM-DD HH:mm:ss
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
      const newScan: SavedTechScan = {
          id: Math.random().toString(36).substr(2, 9),
          name: formattedDate,
          timestamp: Date.now(),
          data: stocks
      };
      setSavedTechScans(prev => [newScan, ...prev]);

    } catch (err) {
      console.error("Tech scan error", err);
      setState(prev => ({ ...prev, isTechScanning: false, error: "Failed to scan Tech stocks." }));
    }
  };

  const handleAhpScan = async () => {
    setState(prev => ({ ...prev, isAhpLoading: true, error: null }));
    try {
      const ranking = await runAhpRanking();
      setState(prev => ({ ...prev, isAhpLoading: false, ahpRanking: ranking }));
    } catch (err) {
      console.error("AHP scan error", err);
      setState(prev => ({ ...prev, isAhpLoading: false, error: "Failed to run AHP Analysis." }));
    }
  };

  const handleMatrixScan = async () => {
    setState(prev => ({ ...prev, isMatrixLoading: true, error: null }));
    try {
        const matrix = await runMatrixAnalysis();
        setState(prev => ({ ...prev, isMatrixLoading: false, matrixData: matrix }));
    } catch (err) {
        console.error("Matrix error", err);
        setState(prev => ({ ...prev, isMatrixLoading: false, error: "Failed to run Matrix analysis." }));
    }
  };

  // Saved Scan Handlers
  const handleRenameTechScan = (id: string, newName: string) => {
    setSavedTechScans(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleLoadTechScan = (scan: SavedTechScan) => {
    setState(prev => ({ ...prev, techStocks: scan.data }));
  };

  const handleDeleteTechScan = (id: string) => {
    setSavedTechScans(prev => prev.filter(s => s.id !== id));
  };

  const handleSelectTrend = (item: TrendItem) => {
      const text = `${item.company} (${item.ticker}) - ${item.sector}\nสถานการณ์ล่าสุด: ${item.catalyst}\nแนวโน้มราคา: ${item.price_trend}`;
      setNewsText(text);
  };

  const handleSelectTech = (item: TechStockItem) => {
    const text = `${item.name} (${item.ticker}) Tech Analysis\nPrice: ${item.current_price}\nSupport: ${item.support_level} | Resistance: ${item.resistance_level}\nTarget 1Q: ${item.target_1q} (Upside ${item.upside})\nReasoning: ${item.reasoning}`;
    setNewsText(text);
  };

  const handleSelectAhp = (item: AhpStockItem) => {
    const text = `AHP QUANT ANALYSIS: ${item.company} (${item.ticker})\nTotal AHP Score: ${item.ahp_score}/100\nFactors:\n- Growth: ${item.factors.growth}/10\n- Value: ${item.factors.value}/10\n- Momentum: ${item.factors.momentum}/10\n- Quality: ${item.factors.quality}/10\n\nRank #${item.rank} in S&P 500 Selection.\nReasoning: ${item.reasoning}`;
    setNewsText(text);
  };

  const handleSelectMatrix = (item: MatrixItem) => {
    const text = `MATRIX ANALYSIS: ${item.ticker}\nAction: ${item.action}\nScores - Fundamental Quality: ${item.importance}/100 | Technical Urgency: ${item.urgency}/100\nReasoning: ${item.reason}`;
    setNewsText(text);
  };

  // Portfolio Handlers
  const handleAddToPortfolio = (item: Omit<PortfolioItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setPortfolioItems(prev => [...prev, newItem]);
  };

  const handleRemoveFromPortfolio = (id: string) => {
    setPortfolioItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAnalyze = () => {
    if (!newsText.trim()) return;

    setState(prev => ({ 
      ...prev, 
      isLynchLoading: true, 
      isManagerLoading: true, 
      error: null,
      lynchResult: null,
      managerResult: null 
    }));

    runLynchAnalysis(newsText)
      .then(result => {
        setState(prev => ({ ...prev, lynchResult: result, isLynchLoading: false }));
      })
      .catch(err => {
        console.error("Lynch Analysis Error:", err);
        setState(prev => ({ 
          ...prev, 
          isLynchLoading: false, 
          error: prev.error ? `${prev.error} | Lynch failed` : "Lynch analysis failed" 
        }));
      });

    runManagerAnalysis(newsText)
      .then(result => {
        setState(prev => ({ ...prev, managerResult: result, isManagerLoading: false }));
      })
      .catch(err => {
        console.error("Manager Analysis Error:", err);
        setState(prev => ({ 
          ...prev, 
          isManagerLoading: false, 
          error: prev.error ? `${prev.error} | Manager failed` : "Manager analysis failed" 
        }));
      });
  };

  // Tab Button Component with Loading State
  const TabButton = ({ id, label, icon, onClick, active, loading }: any) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
        ${active 
            ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900'
        }`}
    >
        <div className="relative">
            <span className="text-sm">{icon}</span>
            {loading && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
            )}
        </div>
        {label}
    </button>
  );

  return (
    <div className="h-screen bg-terminal-bg text-slate-300 font-sans selection:bg-cyan-900 selection:text-cyan-100 flex flex-col overflow-hidden">
      
      {/* Top Professional Header */}
      <header className="bg-terminal-panel border-b border-terminal-border h-10 flex-shrink-0 flex items-center justify-between px-6 z-50">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-bold text-slate-100 tracking-tight text-sm">MARKET<span className="text-cyan-500">MIND</span> <span className="text-xs font-mono text-slate-500 ml-1">PRO.v2.0</span></span>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-2"></div>
            <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGlobalScanning ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span> 
                    {isGlobalScanning ? 'SCANNING MARKETS...' : 'SYSTEM: ONLINE'}
                </span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {/* Refresh All Intelligence Button */}
            <button 
                onClick={handleRefreshAllIntelligence}
                disabled={isGlobalScanning}
                className="flex items-center gap-2 text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded-sm transition-colors disabled:opacity-50"
            >
                <svg className={`w-3 h-3 ${isGlobalScanning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                REFRESH ALL INTEL
            </button>
         </div>
      </header>

      {/* Main Layout: Split vertically */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Top Section: Work Surface (Tools) - Takes up most space */}
        <section className="flex-1 flex flex-col min-h-0 border-b border-slate-700 bg-[#05080F]">
             {/* Navigation Tabs */}
            <div className="bg-terminal-panel border-b border-terminal-border flex overflow-x-auto no-scrollbar shrink-0">
                <TabButton id="brief" label="Brief" icon="⚡" active={activeTab === 'brief'} onClick={() => setActiveTab('brief')} loading={state.isBriefLoading} />
                <TabButton id="portfolio" label="Portfolio" icon="💼" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
                <TabButton id="scan" label="Scanner" icon="🔍" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} loading={state.isScanning} />
                <TabButton id="matrix" label="Decision Matrix" icon="💠" active={activeTab === 'matrix'} onClick={() => setActiveTab('matrix')} loading={state.isMatrixLoading} />
                <TabButton id="tech" label="Tech Hunter" icon="🎯" active={activeTab === 'tech'} onClick={() => setActiveTab('tech')} loading={state.isTechScanning} />
                <TabButton id="ahp" label="Quant AHP" icon="🏆" active={activeTab === 'ahp'} onClick={() => setActiveTab('ahp')} loading={state.isAhpLoading} />
            </div>

            {/* Tool Display Area */}
            <div className="flex-1 p-4 overflow-hidden relative">
                
                {activeTab === 'brief' && (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        {state.isBriefLoading ? (
                             <div className="h-full bg-slate-900 border border-slate-800 animate-pulse rounded-sm"></div>
                        ) : state.dimeBrief ? (
                            <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-sm relative max-w-4xl mx-auto mt-8">
                                <div className="absolute top-0 left-0 w-1 h-full bg-lime-500"></div>
                                <h4 className="text-lime-500 font-mono font-bold text-xs uppercase mb-4 tracking-widest">// MORNING BRIEFING</h4>
                                <div className="text-slate-200 font-thai leading-7 whitespace-pre-line text-sm">{state.dimeBrief}</div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full items-center justify-center text-slate-500 font-mono text-sm gap-2">
                                <span>No data loaded.</span>
                                <button onClick={handleGetBrief} className="text-cyan-500 hover:underline">[ FETCH_BRIEF ]</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div className="h-full">
                        <PortfolioDisplay 
                            items={portfolioItems} 
                            onAdd={handleAddToPortfolio} 
                            onRemove={handleRemoveFromPortfolio} 
                        />
                    </div>
                )}

                {activeTab === 'scan' && (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        {state.isScanning ? (
                            <div className="grid grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 bg-slate-900 border border-slate-800 animate-pulse"></div>)}</div>
                        ) : state.trends ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {state.trends.map((item, idx) => (
                                    <div key={idx} onClick={() => handleSelectTrend(item)} className="bg-slate-900 border border-slate-800 p-4 hover:border-purple-500 hover:bg-slate-800/80 cursor-pointer group transition-all rounded-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-100 font-mono text-lg group-hover:text-purple-400">{item.ticker}</span>
                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${item.price_trend.includes('+') ? 'border-emerald-900 text-emerald-500 bg-emerald-900/10' : 'border-slate-700 text-slate-400'}`}>{item.price_trend}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 truncate mb-2 font-mono uppercase" title={item.company}>{item.company}</div>
                                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{item.catalyst}</div>
                                    </div>
                                ))}
                            </div>
                        ) : ( 
                            <div className="flex flex-col h-full items-center justify-center text-slate-500 font-mono text-sm gap-2">
                                <span>No scan results.</span>
                                <button onClick={handleScan} className="text-cyan-500 hover:underline">[ RUN_SCANNER ]</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'matrix' && (
                    <div className="h-full">
                         {state.isMatrixLoading ? (
                             <div className="h-full bg-slate-900 border border-slate-800 animate-pulse rounded-sm"></div>
                        ) : state.matrixData ? (
                            <EisenhowerMatrix data={state.matrixData} onSelect={handleSelectMatrix} />
                        ) : (
                            <div className="flex flex-col h-full items-center justify-center text-slate-500 font-mono text-sm gap-2">
                                <span>Matrix empty.</span>
                                <button onClick={handleMatrixScan} className="text-cyan-500 hover:underline">[ RUN_MATRIX ]</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tech' && (
                    <div className="h-full">
                         {state.isTechScanning ? (
                             <div className="h-full bg-slate-900 border border-slate-800 animate-pulse rounded-sm"></div>
                        ) : ( 
                            <TechScannerDisplay 
                                data={state.techStocks || []} 
                                onSelect={handleSelectTech} 
                                savedScans={savedTechScans}
                                onRename={handleRenameTechScan}
                                onLoad={handleLoadTechScan}
                                onDelete={handleDeleteTechScan}
                            />
                         )}
                    </div>
                )}

                {activeTab === 'ahp' && (
                    <div className="h-full">
                        {state.isAhpLoading ? (
                             <div className="h-full bg-slate-900 border border-slate-800 animate-pulse rounded-sm"></div>
                        ) : state.ahpRanking ? (
                            <AhpRankingDisplay data={state.ahpRanking} onSelect={handleSelectAhp} />
                        ) : ( 
                            <div className="flex flex-col h-full items-center justify-center text-slate-500 font-mono text-sm gap-2">
                                <span>Model idle.</span>
                                <button onClick={handleAhpScan} className="text-cyan-500 hover:underline">[ RUN_AHP ]</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>

        {/* Bottom Section: Console (Inputs & Agents) - Fixed height or flex proportional */}
        <section className="h-[45vh] flex-shrink-0 bg-[#0F1623] border-t border-slate-800 flex flex-col md:flex-row shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-40">
            
            {/* Input Panel (Left) */}
            <div className="w-full md:w-1/3 border-r border-slate-800 flex flex-col">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">// CONSOLE_INPUT</span>
                    <button onClick={() => setNewsText(SAMPLE_NEWS)} className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono underline">[LOAD_SAMPLE]</button>
                </div>
                <div className="flex-1 relative">
                    <textarea
                        value={newsText}
                        onChange={(e) => setNewsText(e.target.value)}
                        className="w-full h-full bg-[#05080F] text-emerald-400 font-thai text-sm p-4 focus:bg-slate-950 focus:ring-0 outline-none resize-none font-mono leading-relaxed custom-scrollbar placeholder-slate-700"
                        placeholder="> Waiting for market data..."
                    />
                </div>
                <div className="p-2 bg-slate-900/50 border-t border-slate-800">
                     <button
                        onClick={handleAnalyze}
                        disabled={isAnyLoading || !newsText.trim()}
                        className={`
                            w-full py-2 rounded-sm font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 border transition-all
                            ${isAnyLoading 
                            ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black'
                            }
                        `}
                    >
                        {isAnyLoading ? 'PROCESSING AGENTS...' : '[ EXECUTE_ANALYSIS ]'}
                    </button>
                </div>
            </div>

            {/* Agent Output Panel (Right) */}
            <div className="w-full md:w-2/3 flex flex-col bg-[#05080F]">
                <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/80">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">// MULTI-AGENT_OUTPUT_LOG</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-0">
                    {state.error && (
                        <div className="mb-4 p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs font-mono">
                            [ERROR] {state.error}
                        </div>
                    )}
                    
                    {!hasResults ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <svg className="w-12 h-12 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-mono text-slate-500">AWAITING INPUT COMMAND...</span>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                             {/* Peter Lynch Output */}
                             <div className="flex flex-col h-full overflow-y-auto custom-scrollbar border border-slate-800 rounded-sm">
                                {state.isLynchLoading ? <LoadingCard type="lynch" /> : state.lynchResult && <LynchDisplay data={state.lynchResult} />}
                             </div>
                             {/* Fund Manager Output */}
                             <div className="flex flex-col h-full overflow-y-auto custom-scrollbar border border-slate-800 rounded-sm">
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