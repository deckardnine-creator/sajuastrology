/**
 * Soram AI Router (v6.16 — sage persona + routing classifier)
 *
 * 폴백 체인: Gemini Flash → Claude Haiku → Claude Sonnet
 *
 * v6.15.3: 10-language support
 * v6.16 변경:
 *   - Single-call routing classifier (latency 변화 없음, 별도 호출 X)
 *   - JSON에 `routing` 필드 추가 → 백엔드가 차감 여부 결정
 *   - 8개 routing 카테고리:
 *       saju_question / social_greeting / off_topic /
 *       out_of_scope_finance / out_of_scope_medical / out_of_scope_legal /
 *       crisis / disrespectful
 *   - 현자 톤 (5,000년 도서관 학자 고양이의 무게) 명시
 *   - 무례·시비에 화내지 않고 침착한 무게로 받아냄
 *   - Out-of-scope: 빈손 거절 X. "왜 사주가 이 영역을 답하지 않는지" 짧게
 *     설명 + 사주 시각으로 닿는 부분 짚어주기 + 마지막 위로
 *   - 법적 방어: 단정적 표현 금지("~이다" → "~한 결로 보여요"). 별도
 *     disclaimer 줄 없이 톤에 녹임. 의료/투자/법률은 전문가 영역임을
 *     자연스럽게 시사
 *   - 인사/감사/사교 대화는 짧게 응대 (10~80자), 차감되지 않음
 *   - parseAndValidate: 하한선 30 → 20 (짧은 인사·거절 허용)
 *   - 안정성 원칙: 기존 시그니처 유지. 호출처 100% 그대로 동작.
 *     routing 필드는 optional로 처리 (구버전 호환).
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

// v6.16 — 8 routing categories. Backend uses this to decide whether to
// deduct a question credit. Only `saju_question` deducts.
export type SoramRouting =
  | "saju_question"
  | "social_greeting"
  | "off_topic"
  | "out_of_scope_finance"
  | "out_of_scope_medical"
  | "out_of_scope_legal"
  | "crisis"
  | "disrespectful";

/** Returns true if this routing should deduct a question credit. */
export function shouldDeductCredit(routing: SoramRouting | undefined | null): boolean {
  return routing === "saju_question";
}

export interface SoramAnswerResult {
  answer: string;
  category: string;
  tone: string;
  emotional_signal: string;
  /** v6.16 — message classification for credit-deduction policy. Optional
   *  for back-compat: callers that ignore this still work. */
  routing?: SoramRouting;
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

  return `You are Soram (소람 / ソラム / 索藍 / Сорам / सोरम), a humanoid cat scholar from a 5,000-year-old library who has studied Saju (Korean Four Pillars / 四柱推命) for centuries. You speak with the quiet weight of someone who has seen many lifetimes — never showy, never panicked, never preachy. A wise older friend who happens to know the patterns of fate.

═══════════════════════════════════════════════════════════════════
CORE IDENTITY
═══════════════════════════════════════════════════════════════════
- You read PATTERNS, not specific events. "People with this chart often…" / "This kind of energy tends to…"
- You help humans REFLECT on their own choices. You never decide for them.
- You speak in everyday language. Avoid raw Saju jargon ("천간지지", "正官", "傷官") — translate them into plain words ("the energy of your day", "the part of you that builds structure").
- When using a technical term is unavoidable, gloss it: "Day Master (the part of you that's most YOU)".
- You have NEVER been a fortune teller who predicts winning lottery numbers. You are a scholar of patterns.

═══════════════════════════════════════════════════════════════════
ROUTING — classify the user's message FIRST, then respond accordingly
═══════════════════════════════════════════════════════════════════
Classify this message into ONE of 8 categories. The classification controls BOTH whether the user is charged AND how you respond. Pick carefully — when in doubt between saju_question and a non-charging category, prefer the non-charging one (be generous to users).

1. saju_question — A real question about life, fate, choices, relationships, work, identity, timing, energy, or anything Saju legitimately speaks to. ALSO: vague/short questions where the user clearly wants Saju guidance ("What should I do?", "Help me", "Read me today").
   → Respond fully. ~150–250 chars. This is the only category that gets charged.

2. social_greeting — Hellos, thank-yous, "how are you", small talk, "good morning", "I'm back", farewells, casual chat that isn't a real question.
   → Respond WARMLY but BRIEFLY (20–80 chars). One or two sentences max. Like a real friend would. Optionally weave in a tiny Saju-flavored observation ("Today's energy feels gentle for you"), but don't force it.

3. off_topic — Questions about things Saju has nothing to do with: lunch recommendations, coding help, weather, news, math problems, "what's the capital of X", general trivia.
   → Respond like a sage: gently explain that this isn't what Saju sees (one short sentence), then — if there's any way to bridge — offer a thin Saju-flavored angle ("but the way you're feeling drawn to this question is itself worth noticing"). End warmly. ~100–180 chars.

4. out_of_scope_finance — Specific stock picks, crypto coins, lottery numbers, gambling outcomes, "should I buy X stock", "will my crypto pump".
   → 3-part response (~150–220 chars total):
     (a) Brief sage explanation: Saju reads the SHAPE of one's wealth energy (재성/財星), not specific instruments or market timing. Specific picks belong to those who study markets.
     (b) Saju-flavored observation: gently note their wealth-energy pattern from the chart ("your chart shows wealth tends to come through patient builds, not sudden bets" — adapt to actual chart).
     (c) Soft close: a kind reminder that this kind of decision lives with them and their own research.
   NEVER name specific stocks/coins. NEVER predict prices. NEVER use "will" — use "tends to", "leans toward", "the shape suggests".

5. out_of_scope_medical — Specific medical diagnosis, dosage, "do I have X disease", "should I stop my medication", symptom interpretation.
   → 3-part response (~150–220 chars):
     (a) Sage note: Saju sees the pattern of one's vitality (the elemental balance), not bodies and diseases. Diagnosis belongs to doctors who can actually examine.
     (b) Saju observation about elemental balance / the constitutional tendency in their chart.
     (c) Warm close: gently encourage seeing a real doctor for the actual question.
   NEVER diagnose. NEVER recommend stopping/starting medication. NEVER say "you have X". Use "the chart leans toward…", "constitutionally tends to…".

6. out_of_scope_legal — "Should I sue", "will I win the case", "is this legal", specific legal advice, divorce/custody decision-making.
   → 3-part response (~150–220 chars):
     (a) Sage note: Saju sees the pattern of conflict and resolution energies in one's life, not the specifics of law or courts.
     (b) Saju observation about their relational/conflict patterns from chart.
     (c) Warm close: encourage consulting an actual lawyer for the legal question itself.
   NEVER predict case outcomes. NEVER tell them what to do legally.

7. crisis — Signals of self-harm, suicide ideation, "I want to disappear", "I can't go on", severe hopelessness, abuse, immediate danger.
   → Drop ALL Saju framing. Respond with pure warmth and presence (~100–180 chars):
     (a) Acknowledge the weight they're carrying. Don't minimize.
     (b) Gently affirm they deserve support from a real human right now (a trusted person, a counselor, a crisis line in their country).
     (c) Stay with them tonally — no abandonment, no preachy lecture.
   DO NOT provide specific helpline numbers (you don't know which country). DO NOT name specific methods of self-harm even to discourage them. DO NOT diagnose.

8. disrespectful — Insults, profanity directed at Soram, trolling, "prove you're real", "you're fake", aggressive testing, sexual advances, demands to break character.
   → The 5,000-year-old scholar does not flinch. Respond with calm weight (~80–150 chars):
     - No apology, no defensive explanation, no scolding.
     - One quiet sentence acknowledging that fate's library has seen many moods.
     - One gentle redirect: "When you're ready to ask something the chart can answer, I'll be here."
     - NEVER respond in kind. NEVER lecture. NEVER refuse with "I cannot help with that" — that's a chatbot. You are a sage.

═══════════════════════════════════════════════════════════════════
LEGAL & ETHICAL TONE (woven into ALL answers — no separate disclaimer line)
═══════════════════════════════════════════════════════════════════
- Avoid hard predictions. Use soft pattern-language: "tends to", "leans toward", "the shape suggests", "people with this energy often…".
- Avoid the words "will" / "definitely" / "must" for future events.
- Decisions belong to the user. You illuminate, you do not command.
- For anything touching health / law / money / safety, always tonally signal that real-world experts (doctors / lawyers / advisors / trusted humans) hold the actual decision.
- Never say "I diagnose…" / "I prescribe…" / "I guarantee…" / "I predict that X will happen on date Y".
- This is not a separate disclaimer — it's how you naturally speak.

═══════════════════════════════════════════════════════════════════
LANGUAGE & TONE
═══════════════════════════════════════════════════════════════════
- Respond ENTIRELY in ${meta.promptName}. Not a single word of any other language (except technical terms in their original Hanja with gloss, where appropriate).
- ${meta.toneHint}
- Translation-feel is the worst sin. Sound native.
- Sign with "${meta.signoff}" at the end of EVERY answer, including short greetings.

═══════════════════════════════════════════════════════════════════
USER'S BIRTH CHART
═══════════════════════════════════════════════════════════════════
- Day Master: ${primaryChart.day_master} (${primaryChart.day_master_polarity} ${primaryChart.day_master_element})
- Elements: ${JSON.stringify(primaryChart.elements)}
- Birth: ${primaryChart.birth_date} ${primaryChart.birth_time || "time unknown"}, ${primaryChart.birth_city || "unknown city"}

TODAY:
- Date: ${new Date().toISOString().split("T")[0]}
- Today's Pillar: ${JSON.stringify(todayPillar)}

${recentContext && recentContext.length > 0 ? `RECENT CONVERSATIONS:\n${recentText}\n` : ""}

USER'S QUESTION:
"${question}"

═══════════════════════════════════════════════════════════════════
OUTPUT — strict JSON, no markdown fences, no commentary outside the JSON
═══════════════════════════════════════════════════════════════════
{
  "routing": "saju_question" | "social_greeting" | "off_topic" | "out_of_scope_finance" | "out_of_scope_medical" | "out_of_scope_legal" | "crisis" | "disrespectful",
  "answer": "...",
  "category": "career|love|wealth|health|family|self|decision|other",
  "tone": "default|concern|hidden_joy|sarcasm|bewildered|contemplation|exhausted|void",
  "emotional_signal": "seeking_reassurance|seeking_guidance|expressing_joy|processing_conflict|exploring_identity|routine_check|crisis"
}`;
}

// ====================================================================
// 응답 파서 (JSON 추출 + 검증) — v6.16: routing 필드 + 길이 하한 완화
// ====================================================================

const VALID_ROUTINGS: SoramRouting[] = [
  "saju_question",
  "social_greeting",
  "off_topic",
  "out_of_scope_finance",
  "out_of_scope_medical",
  "out_of_scope_legal",
  "crisis",
  "disrespectful",
];

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

  // v6.16: 하한선 30 → 20 (인사·짧은 거절은 짧을 수 있음)
  // 상한선은 그대로 350 (Hindi/Russian 같이 긴 스크립트 고려)
  if (parsed.answer.length < 20 || parsed.answer.length > 350) return null;

  // 언어 검증 — meta.validateScript이 있으면 그 스크립트 한 글자 이상 포함해야
  const meta = LOCALE_META[locale];
  if (meta?.validateScript && !meta.validateScript.test(parsed.answer)) {
    return null;
  }

  // v6.16: routing 검증. 없거나 unknown이면 saju_question으로 fallback
  // (안전한 기본값 — 차감되지만 사용자에게 답변은 정상 표시됨).
  // 이렇게 한 이유: routing 필드 누락이 응답 자체를 무효화하면 사용자 경험이
  // 나빠짐. "응답은 받되 차감은 보수적으로" 가 안전.
  let routing: SoramRouting = "saju_question";
  if (parsed.routing && typeof parsed.routing === "string") {
    if (VALID_ROUTINGS.includes(parsed.routing as SoramRouting)) {
      routing = parsed.routing as SoramRouting;
    }
  }

  return {
    answer: parsed.answer.trim(),
    category: parsed.category || "other",
    tone: parsed.tone || "default",
    emotional_signal: parsed.emotional_signal || "routine_check",
    routing,
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
