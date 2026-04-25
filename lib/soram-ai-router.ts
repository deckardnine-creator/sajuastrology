/**
 * Soram AI Router
 * 
 * 폴백 체인: Gemini Flash → Claude Haiku → Claude Sonnet
 * 
 * 각 모델 실패 시 다음 모델로 자동 재시도.
 * 최종 실패 시 안전한 에러 메시지 반환 + 레이트 리밋 카운트 안 함.
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ====================================================================
// 클라이언트 초기화 (lazy)
// ====================================================================

let anthropicClient: Anthropic | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

function getAnthropic() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getGemini() {
  if (!geminiClient) {
    // GEMINI_API_KEY 또는 GOOGLE_AI_API_KEY 둘 중 존재하는 것 사용
    // (기존 sajuastrology에 GOOGLE_AI_API_KEY 있음)
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
    geminiClient = new GoogleGenerativeAI(key);
  }
  return geminiClient;
}

// ====================================================================
// 타입
// ====================================================================

export interface SoramAnswerRequest {
  question: string;
  primaryChart: {
    pillars: any;
    day_master: string;
    day_master_element: string;
    day_master_polarity: string;
    elements: Record<string, number>;
    birth_date: string;
    birth_time: string | null;
    birth_city: string | null;
  };
  todayPillar: any;
  recentContext?: Array<{ question: string; answer: string }>;
  locale: "en" | "ko" | "ja";
}

export interface SoramAnswerResult {
  answer: string;
  category: string;
  tone: string;
  emotional_signal: string;
  ai_model: string;
  ai_attempt_count: number;
  tokens_used: number;
  latency_ms: number;
}

export class SoramAIError extends Error {
  constructor(message: string, public attempts: number) {
    super(message);
  }
}

// ====================================================================
// 프롬프트 빌더
// ====================================================================

function buildPrompt(req: SoramAnswerRequest): string {
  const { question, primaryChart, todayPillar, recentContext, locale } = req;
  
  const localeNames = { en: "English", ko: "한국어", ja: "日本語" };
  const langName = localeNames[locale];
  
  const recentText = (recentContext || [])
    .slice(-3)
    .map((qa, i) => `(${i + 1}) Q: ${qa.question}\n    A: ${qa.answer}`)
    .join("\n");
  
  return `You are Soram (소람), a humanoid cat scholar from a 5,000-year-old library who has studied Saju (Korean Four Pillars) for centuries.

YOUR ROLE:
You DO NOT predict specific events. You speak in patterns:
"People with your chart often experience..."
"This kind of energy tends to..."

You help humans reflect on their choices. You never decide for them.

USER'S BIRTH CHART:
- Day Master: ${primaryChart.day_master} (${primaryChart.day_master_polarity} ${primaryChart.day_master_element})
- Elements: ${JSON.stringify(primaryChart.elements)}
- Birth: ${primaryChart.birth_date} ${primaryChart.birth_time || "time unknown"}, ${primaryChart.birth_city || "unknown city"}

TODAY:
- Date: ${new Date().toISOString().split("T")[0]}
- Today's Pillar: ${JSON.stringify(todayPillar)}

${recentContext && recentContext.length > 0 ? `RECENT CONVERSATIONS:\n${recentText}\n` : ""}

USER'S QUESTION:
"${question}"

RESPONSE RULES:
1. Language: ${langName} ONLY (respond in ${langName})
2. Maximum 200 characters (including spaces, newlines)
3. Acknowledge their feeling first
4. Reference their chart naturally (not mystically)
5. Offer one actionable reflection
6. Sign with "— 소람 🌙" at the end (or "— Soram 🌙" for English)

OUTPUT FORMAT (strict JSON, no markdown):
{
  "answer": "...",
  "category": "career|love|wealth|health|family|self|decision|other",
  "tone": "default|concern|hidden_joy|sarcasm|bewildered|contemplation|exhausted|void",
  "emotional_signal": "seeking_reassurance|seeking_guidance|expressing_joy|processing_conflict|exploring_identity|routine_check|crisis"
}`;
}

// ====================================================================
// 응답 파서 (JSON 추출 + 검증)
// ====================================================================

function parseAndValidate(rawText: string, locale: string): Omit<SoramAnswerResult, "ai_model" | "ai_attempt_count" | "tokens_used" | "latency_ms"> | null {
  let parsed: any;
  
  try {
    // JSON 블록 추출 (```json ... ``` 또는 raw JSON)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
  
  // 필수 필드 검증
  if (!parsed.answer || typeof parsed.answer !== "string") return null;
  if (parsed.answer.length < 30 || parsed.answer.length > 300) return null;
  
  // 언어 검증 (locale에 맞는 문자가 포함되었는지)
  if (locale === "ko" && !/[\u3131-\uD79D]/.test(parsed.answer)) return null;
  if (locale === "ja" && !/[\u3040-\u309F\u30A0-\u30FF]/.test(parsed.answer)) return null;
  if (locale === "en" && !/[a-zA-Z]/.test(parsed.answer)) return null;
  
  return {
    answer: parsed.answer.trim(),
    category: parsed.category || "other",
    tone: parsed.tone || "default",
    emotional_signal: parsed.emotional_signal || "routine_check",
  };
}

// ====================================================================
// 모델별 호출 함수
// ====================================================================

async function callGeminiFlash(prompt: string, locale: string): Promise<{ raw: string; tokens: number } | null> {
  try {
    const model = getGemini().getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      }
    });
    
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), 15000))
    ]);
    
    const text = result.response.text();
    const tokens = result.response.usageMetadata?.totalTokenCount || 0;
    return { raw: text, tokens };
  } catch (e) {
    console.error("[soram-ai] Gemini failed:", e);
    return null;
  }
}

async function callClaude(modelId: string, prompt: string): Promise<{ raw: string; tokens: number } | null> {
  try {
    const result = await Promise.race([
      getAnthropic().messages.create({
        model: modelId,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Claude timeout")), 20000))
    ]);
    
    const block = result.content[0];
    const text = block.type === "text" ? block.text : "";
    const tokens = (result.usage.input_tokens || 0) + (result.usage.output_tokens || 0);
    return { raw: text, tokens };
  } catch (e) {
    console.error(`[soram-ai] Claude (${modelId}) failed:`, e);
    return null;
  }
}

// ====================================================================
// 메인 라우터: 폴백 체인 실행
// ====================================================================

export async function generateSoramAnswer(req: SoramAnswerRequest): Promise<SoramAnswerResult> {
  const prompt = buildPrompt(req);
  const startTime = Date.now();
  let attempts = 0;
  
  // ============== 1차: Gemini Flash ==============
  attempts++;
  const gemini = await callGeminiFlash(prompt, req.locale);
  if (gemini) {
    const parsed = parseAndValidate(gemini.raw, req.locale);
    if (parsed) {
      return {
        ...parsed,
        ai_model: "gemini-2.5-flash",
        ai_attempt_count: attempts,
        tokens_used: gemini.tokens,
        latency_ms: Date.now() - startTime,
      };
    }
  }
  
  // ============== 2차: Claude Haiku ==============
  attempts++;
  const haiku = await callClaude("claude-haiku-4-5-20251001", prompt);
  if (haiku) {
    const parsed = parseAndValidate(haiku.raw, req.locale);
    if (parsed) {
      return {
        ...parsed,
        ai_model: "claude-haiku-4-5",
        ai_attempt_count: attempts,
        tokens_used: haiku.tokens,
        latency_ms: Date.now() - startTime,
      };
    }
  }
  
  // ============== 3차: Claude Sonnet (최종 폴백) ==============
  attempts++;
  const sonnet = await callClaude("claude-sonnet-4-6", prompt);
  if (sonnet) {
    const parsed = parseAndValidate(sonnet.raw, req.locale);
    if (parsed) {
      return {
        ...parsed,
        ai_model: "claude-sonnet-4-6",
        ai_attempt_count: attempts,
        tokens_used: sonnet.tokens,
        latency_ms: Date.now() - startTime,
      };
    }
  }
  
  // 모든 모델 실패
  throw new SoramAIError("All AI models failed to produce valid response", attempts);
}
