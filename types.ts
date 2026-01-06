
export enum LynchCategory {
  SLOW_GROWERS = 'Slow Growers',
  STALWARTS = 'Stalwarts',
  FAST_GROWERS = 'Fast Growers',
  CYCLICALS = 'Cyclicals',
  TURNAROUNDS = 'Turnarounds',
  ASSET_PLAYS = 'Asset Plays',
  UNKNOWN = 'Unknown'
}

export enum Action {
  BUY = 'Buy',
  HOLD = 'Hold',
  PASS = 'Pass'
}

export interface PeterLynchResult {
  ticker: string;
  category: LynchCategory;
  thesis: string;
  what_to_check: string[];
  action: Action;
}

export interface FundManagerResult {
  summary: string;
  key_risks: string[];
  market_impact: string;
  verdict: string;
  action: 'Buy' | 'Hold' | 'Sell';
  sources?: Array<{ title: string; uri: string }>;
}

export interface TrendItem {
  ticker: string;
  company: string;
  sector: string;
  price_trend: string;
  catalyst: string;
}

export interface TechStockItem {
  ticker: string;
  name: string;
  current_price: string;
  support_level: string;
  resistance_level: string;
  target_1q: string;
  upside: string;
  reasoning: string;
}

export interface SavedTechScan {
  id: string;
  name: string;
  timestamp: number;
  data: TechStockItem[];
}

export interface AhpStockItem {
  rank: number;
  ticker: string;
  company: string;
  sector: string;
  ahp_score: number; // 0-100
  factors: {
    value: number; // 0-10
    growth: number; // 0-10
    momentum: number; // 0-10
    quality: number; // 0-10
  };
  reasoning: string;
}

export interface MatrixItem {
  ticker: string;
  urgency: number; // X-axis (0-100): Technical strength/Catalyst
  importance: number; // Y-axis (0-100): Fundamental Quality/Upside
  action: 'Buy Now' | 'Watchlist' | 'Speculate' | 'Ignore';
  reason: string;
}

export interface PortfolioItem {
  id: string;
  ticker: string;
  shares: number;
  avgPrice: number;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

export interface AnalysisState {
  isLynchLoading: boolean;
  isManagerLoading: boolean;
  isScanning: boolean;
  isBriefLoading: boolean;
  isTechScanning: boolean;
  isAhpLoading: boolean;
  isMatrixLoading: boolean;
  isCryptoLoading: boolean;
  error: string | null;
  lynchResult: PeterLynchResult | null;
  managerResult: FundManagerResult | null;
  trends: TrendItem[] | null;
  dimeBrief: string | null;
  techStocks: TechStockItem[] | null;
  ahpRanking: AhpStockItem[] | null;
  matrixData: MatrixItem[] | null;
  cryptoData: CryptoData[] | null;
  rpmCount: number;
  totalRequests: number;
  apiTier: 'FREE' | 'PRO';
}
