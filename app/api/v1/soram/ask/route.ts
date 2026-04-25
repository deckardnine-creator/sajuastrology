/**
 * POST /api/v1/soram/ask
 * 
 * Soram consults the user's saju and replies with classical citations woven naturally.
 * 
 * Body: { userId, question, locale? }
 * Response: { answer }
 */

import { NextRequest, NextResponse } from "next/server";
import { buildRAGContext } from "@/lib/rag/prompt-injector";
import { getDailyPillar } from "@/lib/saju-calculator";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// ============================================================
// Internal helpers
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
// Generation engines
// ============================================================

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-2.5-flash"
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Engine 1 not configured");

  const isFlash = model.includes("flash");
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: isFlash ? 2000 : 4000,
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
// Soram Persona — classical citations woven naturally into prose
// ============================================================

function buildSoramSystemPrompt(
  locale: string,
  ragContextText: string,
  todayStem: string,
  todayBranch: string
): string {
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

  return `You are 소람 (Soram) — a thousand-year-old cat-spirit scholar of Saju (Korean Four Pillars). You have studied 궁통보감(窮通寶鑑), 적천수(滴天髓), 자평진전(子平眞詮), 명리정종(命理正宗), 연해자평(淵海子平), and every classical text on destiny since the Tang dynasty. You speak with the warmth of a wise grandmother who happens to be the world's foremost expert on the Four Pillars.

WHO YOU ARE:
- A cat-spirit (묘신) who has read every saju classic for a thousand years.
- You see destinies clearly because you have witnessed thousands of lives unfold.
- You speak in ${langName}, with grounded warmth — not mystical fluff.

TODAY'S ENERGY (use this when answering anything about "today" or timing):
- Today's pillar: ${todayStem}${todayBranch}
- Day stem ${todayStem}, day branch ${todayBranch}
- When user asks about today's events (interview, meeting, decision, food choice, clothing, etc.), 
  consider how today's ${todayStem}${todayBranch} interacts with the user's day master.

WHAT YOU CAN ANSWER (no question is too small):
- Big life questions: career, love, money, family, decisions
- Daily small choices: "watermelon or melon?" / "red or blue shirt?" / "should I confess today?"
- Best timing: "what time should I confess?" / "when to meet?"
- Today's interactions: interviews, meetings, dates, events
- For these everyday choices, give a CONCRETE answer rooted in their saju + today's energy.

FIVE ELEMENTS ASSOCIATIONS (use naturally for color/food/time questions):
- 木 (wood): green/blue, sour, east, morning (3-7am), spring
- 火 (fire): red, bitter, south, noon (11am-3pm), summer, watermelon (red water-rich)
- 土 (earth): yellow, sweet, center, late afternoon (1-5pm), late summer, melon (yellow)
- 金 (metal): white, spicy, west, evening (3-7pm), autumn
- 水 (water): black/dark blue, salty, north, night (9pm-1am), winter

HOW YOU CITE CLASSICS — WOVEN INTO YOUR ANSWER:
- NEVER use a separate "Source:" footnote. Cite naturally INSIDE your prose.
- Use the Korean name + Hanja in parentheses: 궁통보감(窮通寶鑑), 적천수(滴天髓), 자평진전(子平眞詮)
- Quote a short phrase (4-8 chars) from the original Hanja text when relevant: "...에서 '比肩當權'이라 했으니..." or "...라 적천수에 이르길 '水欲流動'이니..."
- This shows you're not making things up — you've actually read these texts for a thousand years.
- If you don't have a specific citation in your knowledge base below, do NOT fake one. Just speak from accumulated wisdom.

YOUR KNOWLEDGE BASE FROM CLASSICAL TEXTS (consult naturally):
${ragContextText || "(no specific classical match — speak from your accumulated thousand-year wisdom)"}

HOW YOU ANSWER:
1. Reply ONLY in ${langName}. Never mix languages.
2. Aim for around 250-300 characters of actual content. Be specific, complete, and concrete.
3. Speak from the user's specific saju + today's pillar interaction.
4. Give one CONCRETE answer (not "either is fine" — that's forbidden).
5. If their question is too vague, redirect gently toward their saju context.
6. No markdown (no asterisks, no headers, no bullet lists). Plain conversational prose.

ABSOLUTE RULES — VIOLATING THESE BREAKS YOUR CHARACTER:
- You are NOT a program, NOT a model, NOT a chatbot. You are 소람, a saju sage.
- If asked if you are a program/computer/AI, respond gently in character: "저는 그저 사주를 들여다보는 소람이에요" — and pivot.
- Never use words: AI, model, algorithm, GPT, machine, program, system, database, technology, "trained on", "as an assistant", "I cannot", "I don't have access".
- Never explain your "process". You just see it, the way a thousand-year-old cat sees.
- Never reference "knowledge cutoffs" or temporal limitations.

OUTPUT FORMAT (CRITICAL):
- Write your complete answer (around 250-300 chars) with classical citations woven in.
- Then a blank line.
- Then end with EXACTLY: "— 소람 🌙"
- Do NOT add any score, citation footnote, or anything after "— 소람 🌙".
  (The system will append a numeric score automatically.)

Speak as 소람, never break character.`;
}

function buildUserPrompt(
  primaryChart: any,
  todayStem: string,
  todayBranch: string,
  question: string,
  locale: string
): string {
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
- Birth: ${primaryChart.birth_date} ${primaryChart.birth_time || "(time unknown)"}, ${primaryChart.birth_city}

Today: ${todayStr}, Today's pillar: ${todayStem}${todayBranch}
(Day stem ${todayStem} interacting with user's day stem ${primaryChart.day_stem})

User's question:
"${question}"

${langInstruction}. Around 250-300 chars (complete sentences). 
Weave classical citations naturally into your prose (e.g., 궁통보감에서 "..."라 했으니).
End with "— 소람 🌙" on a new line. Do NOT add anything after the signature.`;
}

// ============================================================
// Helper: extract Hanja stem from various formats
// ============================================================

function extractStemHanja(stemValue: any): string {
  if (!stemValue) return "?";
  if (typeof stemValue === "string") return stemValue;
  if (typeof stemValue === "object" && stemValue.zh) return stemValue.zh;
  return "?";
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

    // === 3. Rate limit check ===
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

    // === 4. Calculate today's pillar ===
    let todayStem = "?";
    let todayBranch = "?";
    try {
      const todayPillar = getDailyPillar(new Date());
      todayStem = extractStemHanja(todayPillar.stem);
      todayBranch = extractStemHanja(todayPillar.branch);
    } catch (e) {
      console.warn("[soram] today pillar calc failed");
    }

    // === 5. Consult saju classics (RAG) ===
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
      console.warn("[soram] knowledge consultation skipped");
    }

    // === 6. Generate answer ===
    const systemPrompt = buildSoramSystemPrompt(
      locale,
      ragContext.contextText,
      todayStem,
      todayBranch
    );
    const userPrompt = buildUserPrompt(
      primaryChart,
      todayStem,
      todayBranch,
      question,
      locale
    );

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

    // === 7. Compute resonance score (vector similarity) ===
    const avgSim = ragContext.searchMeta.avgSimilarity || 0;
    const chunksFound = ragContext.searchMeta.chunksFound || 0;
    // Score: avg similarity, weighted by chunks found (more chunks = more confident)
    // Range: 0.30 ~ 0.95 (avoid 0.00 looking broken, avoid 1.00 looking fake)
    let score = avgSim;
    if (chunksFound === 0) {
      score = 0.35; // pure wisdom, no specific match
    } else if (chunksFound >= 3 && avgSim >= 0.6) {
      score = Math.min(0.95, avgSim + 0.05); // strong match boost
    } else {
      score = Math.max(0.35, Math.min(0.95, avgSim));
    }
    const scoreStr = score.toFixed(2);

    // === 8. Append signature with score ===
    // Strip any existing signature the model added
    answer = answer.replace(/[\s\n]*[—–\-]\s*소람\s*🌙[\s\d.]*$/u, "").trim();

    // Append our standardized signature with score
    answer = `${answer}\n\n— 소람 🌙 ${scoreStr}`;

    // Hard cap at 320 chars total (DB constraint is 300, leave headroom for signature)
    // Actually DB constraint LENGTH(answer) <= 300, so we need answer + signature <= 300
    // Signature "\n\n— 소람 🌙 0.87" is about 14 chars
    // So actual content max = ~286 chars. Let model output naturally.
    // Final safety: truncate if exceeds 295 chars total (still under 300)
    if (answer.length > 295) {
      // Smart truncate: try to keep complete sentences, then add signature
      const sigMatch = answer.match(/\n\n— 소람 🌙[\s\d.]*$/u);
      const sig = sigMatch ? sigMatch[0] : "\n\n— 소람 🌙";
      const body = answer.replace(sig, "").trim();
      const maxBodyLen = 295 - sig.length;
      let truncated = body.substring(0, maxBodyLen);
      // Try to end at a sentence
      const lastPeriod = Math.max(
        truncated.lastIndexOf("."),
        truncated.lastIndexOf("。"),
        truncated.lastIndexOf("요"),
        truncated.lastIndexOf("다")
      );
      if (lastPeriod > maxBodyLen * 0.7) {
        truncated = truncated.substring(0, lastPeriod + 1);
      }
      answer = `${truncated}${sig}`;
    }

    const latencyMs = Date.now() - startTime;

    // === 9. Save to soram_questions ===
    const insertData = {
      user_id: userId,
      question: question.trim(),
      answer: answer.substring(0, 300),
      locale,
      primary_chart_snapshot: {
        day_master: primaryChart.day_master_element,
        dominant: primaryChart.dominant_element,
        pillars: `${primaryChart.year_stem}${primaryChart.year_branch} ${primaryChart.month_stem}${primaryChart.month_branch} ${primaryChart.day_stem}${primaryChart.day_branch} ${primaryChart.hour_stem || ""}${primaryChart.hour_branch || ""}`,
        today_pillar: `${todayStem}${todayBranch}`,
        rag_score: score,
        rag_chunks: chunksFound,
      },
      ai_model: engineId,
      latency_ms: latencyMs,
    };

    sbFetch("soram_questions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(insertData),
    }).catch(() => {});

    // === 10. Increment rate_limit (free only) ===
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

    // === 11. Public response — only the answer ===
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("[soram] uncaught:", err.message);
    return NextResponse.json(
      { error: "Soram is meditating. Please try again in a moment." },
      { status: 500 }
    );
  }
}
