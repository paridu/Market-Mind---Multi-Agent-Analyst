import { GoogleGenAI, Type } from "@google/genai";
import { PeterLynchResult, FundManagerResult, TrendItem, TechStockItem, AhpStockItem, MatrixItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instructions for the Fund Manager Persona
const MANAGER_SYSTEM_PROMPT = `
You are a seasoned Professional Fund Manager with 20 years of experience in global and Thai capital markets.
Your analysis style is:
1. Formal, objective, and data-driven.
2. Focused on macroeconomic impact, fundamental valuation, and risk management.
3. You are skeptical of hype and look for downside protection.

Analyze the provided news snippet. Structure your response in valid JSON with the following keys:
- summary: A concise professional summary of the news (Thai language).
- key_risks: An array of strings listing potential risks (Thai language).
- market_impact: How this affects the broader sector or market (Thai language).
- verdict: STRICTLY START with "Bullish", "Bearish", or "Neutral", followed by your professional reasoning (Thai language). If the direction is unclear, default to "Neutral".
- action: The investment decision. MUST be one of: "Buy", "Hold", "Sell".
`;

// System instructions for the Peter Lynch Persona
const LYNCH_SYSTEM_PROMPT = `
You are Peter Lynch, the legendary investor.
Your analysis style is:
1. You look for the "Story" behind the stock.
2. You classify every stock into one of 6 categories: Slow Growers, Stalwarts, Fast Growers, Cyclicals, Turnarounds, or Asset Plays.
3. You use common sense and look for simple truths found in everyday life.
4. You are practical.

Analyze the provided news snippet. You MUST return the response in strict JSON format.
`;

export async function runManagerAnalysis(newsText: string): Promise<FundManagerResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this market news. You MUST use Google Search to find the latest data, verify facts, and check for recent developments:\n\n${newsText}`,
    config: {
      systemInstruction: MANAGER_SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          key_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          market_impact: { type: Type.STRING },
          verdict: { type: Type.STRING },
          action: { type: Type.STRING, enum: ["Buy", "Hold", "Sell"] }
        },
        required: ["summary", "key_risks", "market_impact", "verdict", "action"]
      }
    }
  });

  if (!response.text) throw new Error("Fund Manager analysis failed to generate text.");
  const result = JSON.parse(response.text) as FundManagerResult;

  // Extract grounding metadata from the response
  // @ts-ignore - The types for groundingMetadata might be loosely defined in some versions
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    result.sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri }));
  }

  return result;
}

export async function runLynchAnalysis(newsText: string): Promise<PeterLynchResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Using Pro for better reasoning on categorization
    contents: `Analyze this market news:\n\n${newsText}`,
    config: {
      systemInstruction: LYNCH_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ticker: { type: Type.STRING, description: "The stock symbol involved" },
          category: { 
            type: Type.STRING, 
            enum: ["Slow Growers", "Stalwarts", "Fast Growers", "Cyclicals", "Turnarounds", "Asset Plays", "Unknown"],
            description: "One of Peter Lynch's 6 stock categories"
          },
          thesis: { type: Type.STRING, description: "The investment story in Peter Lynch's voice (Thai language)" },
          what_to_check: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of things to monitor (Thai language)" },
          action: { 
            type: Type.STRING, 
            enum: ["Buy", "Hold", "Pass"],
            description: "Investment action"
          }
        },
        required: ["ticker", "category", "thesis", "what_to_check", "action"]
      }
    }
  });

  if (!response.text) throw new Error("Peter Lynch analysis failed to generate text.");
  return JSON.parse(response.text) as PeterLynchResult;
}

export async function scanMarketTrends(): Promise<TrendItem[]> {
  const prompt = `
    Use Google Search to identify the top 10 trending US stocks (S&P 500 preferred) specifically in these 3 sectors:
    1. Artificial Intelligence (AI)
    2. Blood/Hematology/Biotech (Healthcare)
    3. New Energy / Clean Energy

    Look for stocks with recent positive momentum, news, or analyst upgrades.
    Return a JSON list of 10 items.
    Each item must have:
    - ticker (e.g. NVDA)
    - company (Company Name)
    - sector (AI, Blood, or Energy)
    - price_trend (e.g. "+5% this week" or "All-time high")
    - catalyst (A 2-sentence summary of the latest news driving this stock, in Thai language).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                ticker: { type: Type.STRING },
                company: { type: Type.STRING },
                sector: { type: Type.STRING },
                price_trend: { type: Type.STRING },
                catalyst: { type: Type.STRING }
            },
            required: ["ticker", "company", "sector", "price_trend", "catalyst"]
        }
      }
    }
  });

  if (!response.text) throw new Error("Market scan failed.");
  return JSON.parse(response.text) as TrendItem[];
}

export async function getDimeMarketBrief(): Promise<string> {
  const prompt = `
    ค้นหา "สรุปตลาดหุ้นสหรัฐ" หรือ "Morning Brief" ล่าสุดจากแหล่งข่าวการเงินไทย หรือสรุปภาวะตลาดสหรัฐฯ เมื่อคืนที่ผ่านมา
    
    เขียนสรุปสั้นๆ (Market Digest) เป็นภาษาไทย ความยาว 1-2 ย่อหน้า
    สไตล์การเขียน: 
    - เลียนแบบสไตล์ "App Dime" หรือ "เพจ Dime" (สนุก, เป็นกันเอง, เข้าใจง่าย, ทันสมัย)
    - สรุปว่าเมื่อคืน S&P 500, Nasdaq, Dow Jones ปิดบวกหรือลบ เพราะอะไร
    - ประเด็นสำคัญ เช่น เงินเฟ้อ, ดอกเบี้ยเฟด, หรือหุ้นเทคโนโลยีตัวใหญ่ๆ
    - **ต้องใส่ Emoji ประกอบให้น่าอ่าน** 🇺🇸📉📈🚀
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text || "ไม่สามารถดึงข้อมูลสรุปตลาดได้ในขณะนี้";
}

export async function scanTechStocks(): Promise<TechStockItem[]> {
  const prompt = `
    Find 32 high-potential Technology stocks (Nasdaq or S&P 500) that are currently attractive for a 1-quarter swing trade (3 months).
    Focus on stocks that are fundamentally strong but might be at a technical support level or "Buy Zone".
    
    Use Google Search to get the LATEST price and technical levels.
    
    Return a JSON array of 32 items. 
    IMPORTANT: The response must be a RAW JSON ARRAY. Do not use Markdown code blocks.
    
    Each item must contain:
    - ticker: Stock Symbol
    - name: Company Name
    - current_price: Latest approximate price (string)
    - support_level: The key support price zone (แนวรับ) (string)
    - resistance_level: The key resistance price zone (แนวต้าน) (string)
    - target_1q: Price target for next quarter (string)
    - upside: Potential percentage gain (e.g. "+15%") (string)
    - reasoning: Short Thai explanation of why it's a buy (Fundamental + Technical)
  `;

  // Switching to Pro model for better handling of large list + search context
  // Removing strict responseSchema to prevent validation errors with search tool output
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  if (!response.text) throw new Error("Tech scan failed (Empty response).");
  
  try {
      // Clean potential markdown blocks
      let cleanJson = response.text.trim();
      if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
      }
      return JSON.parse(cleanJson) as TechStockItem[];
  } catch (e) {
      console.error("JSON Parse Error in Tech Scan:", e, response.text);
      throw new Error("Tech scan failed (Invalid JSON).");
  }
}

export async function runAhpRanking(): Promise<AhpStockItem[]> {
  const prompt = `
    Act as a Quantitative Analyst using the Analytic Hierarchy Process (AHP) to rank stocks.
    Universe: S&P 500.
    
    AHP Criteria Weights:
    1. Growth (30%): EPS growth, Revenue growth.
    2. Value (25%): P/E ratio, PEG ratio.
    3. Momentum (25%): Relative strength, recent price action.
    4. Quality (20%): ROE, Operating Margins, Debt/Equity.

    Task:
    Use Google Search to find current data and screen the S&P 500.
    Select the Top 30 stocks that score highest across these weighted criteria RIGHT NOW.
    
    Return a JSON list sorted by 'rank'. Each item must contain:
    - rank: 1 to 30
    - ticker: Stock Symbol
    - company: Company Name
    - sector: Sector
    - ahp_score: A calculated total score from 0-100 based on your AHP simulation.
    - factors: An object with sub-scores (0-10) for 'value', 'growth', 'momentum', 'quality'.
    - reasoning: A 1-sentence explanation of why it ranks high (in Thai).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rank: { type: Type.INTEGER },
            ticker: { type: Type.STRING },
            company: { type: Type.STRING },
            sector: { type: Type.STRING },
            ahp_score: { type: Type.NUMBER },
            factors: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                growth: { type: Type.NUMBER },
                momentum: { type: Type.NUMBER },
                quality: { type: Type.NUMBER }
              },
              required: ["value", "growth", "momentum", "quality"]
            },
            reasoning: { type: Type.STRING }
          },
          required: ["rank", "ticker", "company", "sector", "ahp_score", "factors", "reasoning"]
        }
      }
    }
  });

  if (!response.text) throw new Error("AHP Ranking failed.");
  return JSON.parse(response.text) as AhpStockItem[];
}

export async function runMatrixAnalysis(): Promise<MatrixItem[]> {
  const prompt = `
    Perform a multi-dimensional analysis on 8 trending US Tech/Growth stocks to place them on an Eisenhower Matrix (2x2 Grid).
    
    Axis Definition:
    - X-Axis (Urgency): Technical Strength, Catalyst Proximity, Momentum. (0 = Low, 100 = High)
    - Y-Axis (Importance): Fundamental Quality, Long-term Moat, Financial Health. (0 = Low, 100 = High)

    Quadrants:
    1. High Importance, High Urgency -> "Buy Now" (Top Right)
    2. High Importance, Low Urgency -> "Watchlist/Accumulate" (Top Left)
    3. Low Importance, High Urgency -> "Speculate/Trade" (Bottom Right)
    4. Low Importance, Low Urgency -> "Ignore/Avoid" (Bottom Left)

    Use Google Search to get current data.
    Return a JSON array of 8 items.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            urgency: { type: Type.NUMBER, description: "0-100" },
            importance: { type: Type.NUMBER, description: "0-100" },
            action: { type: Type.STRING, enum: ['Buy Now', 'Watchlist', 'Speculate', 'Ignore'] },
            reason: { type: Type.STRING }
          },
          required: ["ticker", "urgency", "importance", "action", "reason"]
        }
      }
    }
  });

  if (!response.text) throw new Error("Matrix analysis failed.");
  return JSON.parse(response.text) as MatrixItem[];
}