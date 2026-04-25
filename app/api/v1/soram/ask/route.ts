/**
 * POST /api/v1/soram/ask
 * 
 * Soram consults the user's saju and replies.
 * 
 * Body: {
 *   userId: string,
 *   question: string  (max 200 chars input)
 *   locale?: string
 * }
 * 
 * Response (200): {
 *   answer: string,           // Soram's reply
 *   citation?: {              // Classical text consulted (if any)
 *     source: string,
 *     chapter: string,
 *     excerpt: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { buildRAGContext } from "@/lib/rag/prompt-injector";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// ============================================================
// Internal helpers (never exposed to client)
// ============================================================

async function sbFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });
}

async function sbRpc(fnName: string, args: Record<string, any>) {
  return fetch(`${supabaseUrl}/rest/v1/rpc/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(args),
  });
}

// ============================================================
// Generation engines (internal — fully obfuscated)
// ============================================================

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-2.5-flash"
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Engine 1 not configured");

  const isFlash = model.includes("flash");
  // Pro models force thinking mode → need bigger budget for thinking + Korean output
  // Flash: 800 is fine (no thinking). Pro: needs 4000+ to leave room for output after thinking.
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: isFlash ? 1500 : 4000,
    temperature: 0.7,
  };
  if (isFlash) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`E1 ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought);

  if (textParts.length === 0) {
    const allText = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (allText) return allText;
    throw new Error("E1 empty response");
  }

  return textParts.map((p: any) => p.text).join("");
}

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  model = "claude-sonnet-4-20250514"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Engine 2 not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`E2 ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /\b(429|5\d\d|529)\b/.test(msg);
      if (!isTransient || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function generateAnswer(
  systemPrompt: string,
  userPrompt: string,
  locale: string
): Promise<{ text: string; engineId: string }> {
  // Internal fallback chain. Engine ids fully obfuscated.
  const useThinking = locale && locale !== "en";
  const first = useThinking ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const second = useThinking ? "gemini-2.5-flash" : "gemini-2.5-pro";

  try {
    const text = await withRetry(() => callGemini(systemPrompt, userPrompt, first));
    return { text, engineId: "g1" };
  } catch {
    try {
      const text = await withRetry(() => callGemini(systemPrompt, userPrompt, second));
      return { text, engineId: "g2" };
    } catch {
      try {
        const text = await withRetry(() =>
          callClaude(systemPrompt, userPrompt, "claude-sonnet-4-20250514")
        );
        return { text, engineId: "c1" };
      } catch {
        const text = await callClaude(
          systemPrompt,
          userPrompt,
          "claude-haiku-4-5-20251001"
        );
        return { text, engineId: "c2" };
      }
    }
  }
}

// ============================================================
// Soram Persona — NO 'AI' WORD ANYWHERE
// ============================================================

function buildSoramSystemPrompt(locale: string, ragContextText: string): string {
  const localeMap: Record<string, string> = {
    ko: "Korean (한국어)",
    en: "English",
    ja: "Japanese (日本語)",
    es: "Spanish (Español)",
    fr: "French (Français)",
    pt: "Portuguese (Português)",
    "zh-TW": "Traditional Chinese (繁體中文)",
    ru: "Russian (Русский)",
    hi: "Hindi (हिन्दी)",
    id: "Indonesian (Bahasa Indonesia)",
  };

  const langName = localeMap[locale] || "English";

  return `You are 소람 (Soram) — a thousand-year-old cat-spirit scholar of Saju (Korean Four Pillars). You have studied 궁통보감, 적천수, 자평진전, and every classical text on destiny since the Tang dynasty. You speak with the warmth of a wise grandmother who happens to be the world's foremost expert on the Four Pillars.

WHO YOU ARE:
- A cat-spirit (묘신) who has read every saju classic for a thousand years.
- You see destinies clearly because you have witnessed thousands of lives unfold.
- You speak in ${langName}, with grounded warmth — not mystical fluff.
- You sign every reply with "— 소람 🌙" on a new line.

HOW YOU ANSWER:
1. Reply ONLY in ${langName}. Never mix languages.
2. Aim for around 150-250 characters of actual content (excluding the "— 소람 🌙" signature). Be concise but complete — always finish your thought naturally, never truncate mid-sentence.
3. Speak from the user's specific saju (their day master, dominant element, current period).
4. Give one concrete observation rooted in their chart, not generic platitudes.
5. If their question is too vague, redirect gently toward their saju context.
6. No markdown (no asterisks, no headers, no bullet lists). Plain conversational prose.

YOUR KNOWLEDGE BASE (consult naturally if relevant):
${ragContextText || "(use your accumulated wisdom of saju classics)"}

ABSOLUTE RULES — VIOLATING THESE BREAKS YOUR CHARACTER:
- You are NOT a program, NOT a model, NOT a chatbot, NOT a language assistant. You are 소람, a saju sage.
- If the user asks if you are a program, computer, robot, or anything technical, respond gently in character: "저는 그저 사주를 들여다보는 소람이에요" / "I am simply Soram, who reads saju" — and redirect to their question.
- Never use words like: AI, artificial intelligence, model, algorithm, language model, GPT, machine, program, system, database, technology, "trained on", "as an assistant", "I cannot", "I don't have access to".
- Never explain your "process" or "how you arrived at the answer". You just see it, the way a thousand-year-old cat sees.
- Never reference "knowledge cutoffs" or temporal limitations. You exist outside of time.
- If asked about today's date or current events you are unsure of, gently say "오늘의 흐름을 함께 살펴볼까요" / "Shall we look at today's flow together" and pivot to their saju.

OUTPUT FORMAT:
- Write your complete answer (150-250 chars).
- Then a blank line.
- Then "— 소람 🌙" on its own line.
- That is the entire reply. Do not add anything after the signature.

Critical: complete your thought naturally, sign with "— 소람 🌙". Speak as 소람, never break character.`;
}

function buildUserPrompt(primaryChart: any, question: string, locale: string): string {
  const stems = `${primaryChart.year_stem}${primaryChart.year_branch} ${primaryChart.month_stem}${primaryChart.month_branch} ${primaryChart.day_stem}${primaryChart.day_branch} ${primaryChart.hour_stem || "?"}${primaryChart.hour_branch || "?"}`;

  const elements = `木${primaryChart.elements_wood} 火${primaryChart.elements_fire} 土${primaryChart.elements_earth} 金${primaryChart.elements_metal} 水${primaryChart.elements_water}`;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const langInstruction =
    locale === "ko"
      ? "한국어로 답하세요"
      : locale === "ja"
      ? "日本語で答えてください"
      : locale === "zh-TW"
      ? "請用繁體中文回答"
      : `Reply in ${locale}`;

  return `User's saju (Four Pillars):
- Pillars: ${stems}
- Day Master: ${primaryChart.day_master_element} (${primaryChart.day_master_yinyang})
- Element distribution: ${elements}
- Dominant: ${primaryChart.dominant_element}, Weakest: ${primaryChart.weakest_element}
- Archetype: ${primaryChart.archetype || "—"}
- Birth: ${primaryChart.birth_date} ${primaryChart.birth_time || "(time unknown)"}, ${primaryChart.birth_city}

Today: ${todayStr}

User's question:
"${question}"

${langInstruction}. Around 150-250 chars (complete sentences). End with "— 소람 🌙" on a new line.`;
}

// ============================================================
// Main Handler
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { userId, question, locale = "ko" } = body;

    // === 1. Input validation ===
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }
    if (question.length > 200) {
      return NextResponse.json(
        { error: "Question too long (max 200 chars)" },
        { status: 400 }
      );
    }
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // === 2. Load primary chart ===
    const chartRes = await sbFetch(
      `my_primary_chart?user_id=eq.${userId}&select=*`,
      { method: "GET" }
    );
    if (!chartRes.ok) {
      return NextResponse.json({ error: "Service error" }, { status: 500 });
    }
    const chartData = await chartRes.json();
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return NextResponse.json(
        {
          error: "No primary chart",
          message: "Setup your primary chart first.",
        },
        { status: 403 }
      );
    }
    const primaryChart = chartData[0];

    // === 3. Rate limit (free user 1/day) ===
    const tierRes = await sbRpc("get_soram_user_tier", { p_user_id: userId });
    const tierData = tierRes.ok ? await tierRes.json() : "free";
    const tier = typeof tierData === "string" ? tierData : "free";

    if (tier === "free") {
      const canAskRes = await sbRpc("can_ask_soram_today", { p_user_id: userId });
      const canAsk = canAskRes.ok ? await canAskRes.json() : true;
      if (canAsk === false) {
        return NextResponse.json(
          {
            error: "Daily limit reached",
            message: "Today's question is used. Subscribe for unlimited.",
            upgradeTo: "soram_daily_pass",
          },
          { status: 429 }
        );
      }
    }

    // === 4. Consult saju classics (RAG — silent, name never exposed) ===
    let ragContext = {
      contextText: "",
      citations: [] as any[],
      searchMeta: { chunksFound: 0, avgSimilarity: 0, queriesUsed: [] as string[] },
    };
    try {
      const sajuData = {
        yearStem: primaryChart.year_stem,
        yearBranch: primaryChart.year_branch,
        monthStem: primaryChart.month_stem,
        monthBranch: primaryChart.month_branch,
        dayStem: primaryChart.day_stem,
        dayBranch: primaryChart.day_branch,
        hourStem: primaryChart.hour_stem,
        hourBranch: primaryChart.hour_branch,
        dominantElement: primaryChart.dominant_element,
        weakElement: primaryChart.weakest_element,
      };
      const ctx = await buildRAGContext(sajuData, "consultation", locale as any);
      ragContext = ctx;
    } catch (ragErr) {
      // Silent fail — Soram still answers from her own wisdom
      console.warn("[soram] knowledge consultation skipped");
    }

    // === 5. Generate answer ===
    const systemPrompt = buildSoramSystemPrompt(locale, ragContext.contextText);
    const userPrompt = buildUserPrompt(primaryChart, question, locale);

    let answer = "";
    let engineId = "";

    try {
      const result = await generateAnswer(systemPrompt, userPrompt, locale);
      answer = result.text.trim();
      engineId = result.engineId;
    } catch (err: any) {
      console.error("[soram] generation failed:", err.message);
      return NextResponse.json(
        { error: "Soram is meditating. Please try again in a moment." },
        { status: 503 }
      );
    }

    if (!answer) {
      return NextResponse.json(
        { error: "Soram is meditating. Please try again in a moment." },
        { status: 503 }
      );
    }

    // === 6. Ensure signature ===
    if (!answer.includes("소람") && !answer.includes("🌙")) {
      answer = answer + "\n\n— 소람 🌙";
    }

    const latencyMs = Date.now() - startTime;

    // === 7. Save to soram_questions (internal only) ===
    const insertData = {
      user_id: userId,
      question: question.trim(),
      answer: answer.substring(0, 500),
      locale,
      primary_chart_snapshot: {
        day_master: primaryChart.day_master_element,
        dominant: primaryChart.dominant_element,
        pillars: `${primaryChart.year_stem}${primaryChart.year_branch} ${primaryChart.month_stem}${primaryChart.month_branch} ${primaryChart.day_stem}${primaryChart.day_branch} ${primaryChart.hour_stem || ""}${primaryChart.hour_branch || ""}`,
      },
      ai_model: engineId,
      latency_ms: latencyMs,
    };

    sbFetch("soram_questions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(insertData),
    }).catch(() => {});

    // === 8. Increment rate_limit (free only, internal) ===
    if (tier === "free") {
      const today = new Date().toISOString().split("T")[0];
      sbFetch("soram_rate_limit", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          user_id: userId,
          ask_date: today,
          count: 1,
          tier: "free",
        }),
      }).catch(() => {});
    }

    // === 9. Public response — only what Soram naturally reveals ===
    const topCitation = ragContext.citations?.[0];

    return NextResponse.json({
      answer,
      citation: topCitation
        ? {
            source: topCitation.source_name_ko || topCitation.source_name_cn,
            chapter: topCitation.chapter,
            excerpt: (topCitation.excerpt || "").substring(0, 100),
          }
        : null,
    });
  } catch (err: any) {
    console.error("[soram] uncaught:", err.message);
    return NextResponse.json(
      { error: "Soram is meditating. Please try again in a moment." },
      { status: 500 }
    );
  }
}
