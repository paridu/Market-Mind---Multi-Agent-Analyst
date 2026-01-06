
import { GoogleGenAI, Type } from "@google/genai";
import { PeterLynchResult, FundManagerResult, TrendItem, TechStockItem, AhpStockItem, MatrixItem, CryptoData } from '../types';

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("API_KEY is missing. Ensure it is set in Vercel Environment Variables.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const MANAGER_SYSTEM_PROMPT = `
You are a seasoned Professional Fund Manager.
Analysis style: Formal, data-driven, focused on macro impact and risk management.
Analyze the provided news. Structure in JSON:
- summary (Thai)
- key_risks (Thai array)
- market_impact (Thai)
- verdict: "Bullish", "Bearish", or "Neutral" + reason (Thai)
- action: "Buy", "Hold", "Sell"
`;

const LYNCH_SYSTEM_PROMPT = `
You are Peter Lynch.
Style: Look for the story, classify into 6 categories (Slow Growers, Stalwarts, Fast Growers, Cyclicals, Turnarounds, Asset Plays).
Structure in JSON:
- ticker
- category
- thesis (Thai)
- what_to_check (Thai array)
- action: "Buy", "Hold", "Pass"
`;

export async function runManagerAnalysis(newsText: string): Promise<FundManagerResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this market news. Use Google Search for facts:\n\n${newsText}`,
    config: {
      systemInstruction: MANAGER_SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  if (!response.text) throw new Error("Manager analysis failed.");
  const result = JSON.parse(response.text) as FundManagerResult;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    result.sources = groundingChunks.map((c: any) => c.web).filter((w: any) => w).map((w: any) => ({ title: w.title, uri: w.uri }));
  }
  return result;
}

export async function runLynchAnalysis(newsText: string): Promise<PeterLynchResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this news in Peter Lynch style:\n\n${newsText}`,
    config: {
      systemInstruction: LYNCH_SYSTEM_PROMPT,
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}") as PeterLynchResult;
}

export async function scanMarketTrends(): Promise<TrendItem[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Find top 10 trending US stocks in AI, Biotech, and Energy sectors via Search. Return JSON array.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function getDimeMarketBrief(): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "สรุปตลาดหุ้นสหรัฐฯ เมื่อคืน สไตล์ App Dime ใส่ Emoji เยอะๆ ภาษาไทย",
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "Error fetching brief";
}

export async function fetchTopCryptos(): Promise<CryptoData[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Find current top 10 Cryptocurrencies by market cap. Return JSON array with fields: id, symbol, name, current_price, market_cap, market_cap_rank, price_change_percentage_24h, image (use coinmarketcap or coingecko direct icon links if possible or just placeholders).",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function scanTechStocks(): Promise<TechStockItem[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: "Scan 32 tech stocks for 1Q trade. Support/Resistance/Upside/Reasoning in Thai. Return JSON array.",
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
}

export async function runAhpRanking(): Promise<AhpStockItem[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: "Perform AHP ranking for top 30 S&P500 stocks. Weight: Growth 30, Value 25, Momentum 25, Quality 20. Return JSON array.",
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
}

export async function runMatrixAnalysis(): Promise<MatrixItem[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Analyze 8 trending stocks for Eisenhower Matrix (Urgency vs Importance). Return JSON array.",
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
}
