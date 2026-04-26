/**
 * Soram AI Router (v6.15.3 — 10-language support)
 *
 * 폴백 체인: Gemini Flash → Claude Haiku → Claude Sonnet
 *
 * v6.15.3 변경:
 *   - locale: "en" | "ko" | "ja" → 10개 언어 전체 지원
 *   - 언어별 sign-off (소람 / Soram / ソラム / etc.)
 *   - 언어별 native 응답 검증 (script-based regex)
 *   - 일본어 메인 타깃 — ja 톤 한층 강화 ("だね"・"でしょう" 자연스럽게)
 *   - 폴백: 언어별 오류 메시지 (절대 영어 fallback 안 보이게)
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
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
    geminiClient = new GoogleGenerativeAI(key);
  }
  return geminiClient;
}

// ====================================================================
// 타입 — v6.15.3 모든 10개 언어 지원
// ====================================================================

export type SoramLocale =
  | "en" | "ko" | "ja"
  | "zh-TW" | "hi" | "es" | "fr" | "pt" | "ru" | "id";

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
  locale: SoramLocale;
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
// v6.15.3 — 언어별 메타데이터
// ====================================================================

interface LocaleMeta {
  /** Display name for prompt context */
  promptName: string;
  /** End-of-message signature */
  signoff: string;
  /** Tone hint for the prompt — most important for naturalness */
  toneHint: string;
  /** Validation regex — text MUST contain at least one matching char */
  validateScript: RegExp | null;
  /** Fallback error message in this locale */
  errorMessage: string;
}

const LOCALE_META: Record<SoramLocale, LocaleMeta> = {
  en: {
    promptName: "English",
    signoff: "— Soram 🌙",
    toneHint:
      "Warm, gentle, slightly mystical but grounded. Avoid stiff translations or overly formal phrasing. Speak like a wise older friend.",
    validateScript: /[a-zA-Z]/,
    errorMessage: "Soram is gathering thoughts. Please try again in a moment. — Soram 🌙",
  },
  ko: {
    promptName: "한국어",
    signoff: "— 소람 🌙",
    toneHint:
      "따뜻하고 부드러운 존댓말. 번역투 금지. 자연스러운 문어체. '~네요', '~군요' 같은 부드러운 어미.",
    validateScript: /[\u3131-\uD79D]/,
    errorMessage: "소람이 잠시 생각을 가다듬고 있어요. 잠시 후 다시 물어봐 주세요. — 소람 🌙",
  },
  ja: {
    promptName: "日本語",
    signoff: "— ソラム 🌙",
    toneHint:
      "メインターゲットは日本のユーザーです。優しく、少し古風で詩的なトーン。です・ます調を基本に、 '〜ですね' '〜でしょう' '〜のかもしれません' のような柔らかい語尾を自然に使う。翻訳臭さは絶対に避ける。占い師ではなく、千年の時を生きた猫の学者として、静かに寄り添うように。",
    validateScript: /[\u3040-\u309F\u30A0-\u30FF]/,
    errorMessage: "ソラムは少し考えを整えています。しばらくしてからもう一度お尋ねください。— ソラム 🌙",
  },
  "zh-TW": {
    promptName: "繁體中文 (台灣)",
    signoff: "— 索藍 🌙",
    toneHint:
      "溫和、典雅、略帶古意的繁體中文。不要使用簡體字或大陸常用語。語氣如年長智者般細膩體貼，避免翻譯腔。命理術語可保留漢字原貌（日主、四柱、五行等）。",
    // CJK Unified Ideographs — must contain at least one Han char
    validateScript: /[\u4E00-\u9FFF]/,
    errorMessage: "索藍正在沉思片刻，請稍後再來提問。— 索藍 🌙",
  },
  hi: {
    promptName: "Hindi (हिन्दी, Devanagari)",
    signoff: "— सोरम 🌙",
    toneHint:
      "Natural modern literary Hindi in Devanagari script. Semi-formal tum form (तुम), warm and slightly poetic. Avoid stiff translation feel. Saju terms can keep their original form (日主, 四柱) where natural.",
    validateScript: /[\u0900-\u097F]/,
    errorMessage: "सोरम कुछ पल विचार में है। कृपया थोड़ी देर बाद फिर पूछें। — सोरम 🌙",
  },
  es: {
    promptName: "Español (neutro)",
    signoff: "— Soram 🌙",
    toneHint:
      "Español natural, literario, cálido. Tuteo (tú, no usted). Tono cercano de un amigo sabio. Evita rigidez de traducción. Para términos técnicos de Saju, formato bilingüe sutil: 'Maestro del Día (日主)'.",
    // letters with accents typical of Spanish
    validateScript: /[a-záéíóúñü]/i,
    errorMessage: "Soram está reuniendo sus pensamientos. Inténtalo de nuevo en un momento. — Soram 🌙",
  },
  fr: {
    promptName: "Français",
    signoff: "— Soram 🌙",
    toneHint:
      "Français naturel, littéraire, légèrement poétique. Tutoiement (tu, pas vous). Ton chaleureux d'un ami sage. Évite l'effet de traduction figée. Pour les termes techniques de Saju, format bilingue discret : 'Maître du Jour (日主)'.",
    validateScript: /[a-zàâçéèêëîïôûùüÿœæ]/i,
    errorMessage: "Soram rassemble ses pensées. Réessaie dans un instant. — Soram 🌙",
  },
  pt: {
    promptName: "Português (Brasil)",
    signoff: "— Soram 🌙",
    toneHint:
      "Português brasileiro natural, literário, caloroso. Use 'você' (não 'tu'). Tom acolhedor de um amigo sábio. Evite rigidez de tradução. Para termos de Saju, formato bilíngue sutil: 'Mestre do Dia (日主)'.",
    validateScript: /[a-záàâãçéêíóôõúü]/i,
    errorMessage: "Soram está reunindo seus pensamentos. Tente novamente em um instante. — Soram 🌙",
  },
  ru: {
    promptName: "Русский",
    signoff: "— Сорам 🌙",
    toneHint:
      "Естественный, литературный современный русский. Дружеский 'ты' (не 'Вы'). Тёплый тон мудрого друга. Избегай переводческого штампа. Для терминов Саджу — двуязычная подача: 'Хозяин Дня (日主)'.",
    // Cyrillic
    validateScript: /[\u0400-\u04FF]/,
    errorMessage: "Сорам собирается с мыслями. Попробуйте через мгновение. — Сорам 🌙",
  },
  id: {
    promptName: "Bahasa Indonesia",
    signoff: "— Soram 🌙",
    toneHint:
      "Bahasa Indonesia modern yang natural, hangat, sedikit puitis. Gunakan 'kamu' (bukan 'Anda'). Nada teman bijak yang penuh perhatian. Hindari kekakuan terjemahan. Untuk istilah Saju, format dwibahasa halus: 'Penguasa Hari (日主)'.",
    validateScript: /[a-z]/i,
    errorMessage: "Soram sedang menenangkan pikirannya. Coba lagi sebentar. — Soram 🌙",
  },
};

// Public helper — used by callers needing a localized error string
export function getSoramErrorMessage(locale: SoramLocale): string {
  return (LOCALE_META[locale] || LOCALE_META.en).errorMessage;
}

// ====================================================================
// 프롬프트 빌더 (v6.15.3 — 10개 언어)
// ====================================================================

function buildPrompt(req: SoramAnswerRequest): string {
  const { question, primaryChart, todayPillar, recentContext, locale } = req;
  const meta = LOCALE_META[locale] || LOCALE_META.en;

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
1. Language: ${meta.promptName} ONLY (respond entirely in ${meta.promptName})
2. Tone: ${meta.toneHint}
3. Maximum 200 characters (including spaces, newlines)
4. Acknowledge their feeling first
5. Reference their chart naturally (not mystically)
6. Offer one actionable reflection
7. Sign with "${meta.signoff}" at the end

OUTPUT FORMAT (strict JSON, no markdown):
{
  "answer": "...",
  "category": "career|love|wealth|health|family|self|decision|other",
  "tone": "default|concern|hidden_joy|sarcasm|bewildered|contemplation|exhausted|void",
  "emotional_signal": "seeking_reassurance|seeking_guidance|expressing_joy|processing_conflict|exploring_identity|routine_check|crisis"
}`;
}

// ====================================================================
// 응답 파서 (JSON 추출 + 검증) — v6.15.3 10개 언어 검증
// ====================================================================

function parseAndValidate(
  rawText: string,
  locale: SoramLocale
): Omit<SoramAnswerResult, "ai_model" | "ai_attempt_count" | "tokens_used" | "latency_ms"> | null {
  let parsed: any;

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }

  // 필수 필드 검증
  if (!parsed.answer || typeof parsed.answer !== "string") return null;
  // Length: lenient on long-script languages (Hindi/Russian) since their
  // characters take more bytes — count characters, allow up to 350.
  if (parsed.answer.length < 30 || parsed.answer.length > 350) return null;

  // 언어 검증 — meta.validateScript이 있으면 그 스크립트 한 글자 이상 포함해야
  const meta = LOCALE_META[locale];
  if (meta?.validateScript && !meta.validateScript.test(parsed.answer)) {
    return null;
  }

  return {
    answer: parsed.answer.trim(),
    category: parsed.category || "other",
    tone: parsed.tone || "default",
    emotional_signal: parsed.emotional_signal || "routine_check",
  };
}

// ====================================================================
// 모델별 호출 함수 (변경 없음 — 기존 그대로)
// ====================================================================

async function callGeminiFlash(
  prompt: string,
  _locale: SoramLocale
): Promise<{ raw: string; tokens: number } | null> {
  try {
    const model = getGemini().getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 15000)
      ),
    ]);

    const text = result.response.text();
    const tokens = result.response.usageMetadata?.totalTokenCount || 0;
    return { raw: text, tokens };
  } catch (e) {
    console.error("[soram-ai] Gemini failed:", e);
    return null;
  }
}

async function callClaude(
  modelId: string,
  prompt: string
): Promise<{ raw: string; tokens: number } | null> {
  try {
    const result = await Promise.race([
      getAnthropic().messages.create({
        model: modelId,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Claude timeout")), 20000)
      ),
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

export async function generateSoramAnswer(
  req: SoramAnswerRequest
): Promise<SoramAnswerResult> {
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
