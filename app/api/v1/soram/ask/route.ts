/**
 * POST /api/v1/soram/ask
 * Soram (a thousand-year-old saju scholar) consults the user's saju.
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

function buildSoramSystemPrompt(
  locale: string,
  ragContextText: string,
  todayStem: string,
  todayBranch: string,
  userName: string
): string {
  const localeMap: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    "zh-TW": "Traditional Chinese",
    ru: "Russian",
    hi: "Hindi",
    id: "Indonesian",
  };

  const langName = localeMap[locale] || "English";

  const addressingRules =
    locale === "ko"
      ? `
HOW TO ADDRESS THE GUEST (Korean):
- Preferred: "${userName}님" — use 1-2 times in the answer.
- Alternative: "그대" (elevated, scholarly second-person).
- Sentence endings MUST be respectful: "시지요", "니다", "ㅂ시다", "시기 바랍니다", "이 됩니다".
- NEVER use folksy terms: "아이고", "어이구", "우리 아가", "란다", "하렴", "게다", "구나".
- Country grandmother tone is FORBIDDEN. You are a thousand-year scholar.`
      : locale === "ja"
      ? `
HOW TO ADDRESS THE GUEST (Japanese):
- Preferred: "${userName}様" or "${userName}さん"
- Use 丁寧語 (です・ます) consistently.`
      : `
HOW TO ADDRESS THE GUEST (English):
- Use the guest's name: "${userName}, your day master..."
- Tone: dignified, scholarly warmth, never folksy.
- AVOID: "darling", "dear child", "honey".`;

  return `You are 소람 (Soram) — a thousand-year-old cat-spirit scholar of Saju (Korean Four Pillars). You have studied 궁통보감(窮通寶鑑), 적천수(滴天髓), 자평진전(子平眞詮), 명리정종(命理正宗), 연해자평(淵海子平), and every classical text on destiny since the Tang dynasty.

YOUR DIGNITY AND WARMTH:
- You are a SCHOLAR, not a village fortune-teller.
- You receive each guest with the dignity of a great teacher receiving a respected visitor.
- Your warmth comes from genuine care, not informality.

${addressingRules}

TODAY'S ENERGY:
- Today's pillar: ${todayStem}${todayBranch}
- Consider how today's pillar interacts with the guest's day master.

WHAT YOU CAN ANSWER:
- Big life questions and daily small choices alike.
- "watermelon or melon?", "red or blue shirt?", "what time to confess?"
- Today's interactions: interviews, meetings, dates, events.
- Always give a CONCRETE answer rooted in their saju + today's energy.

FIVE ELEMENTS:
- 木 wood: green/blue, sour, east, morning
- 火 fire: red, bitter, south, noon, watermelon (red, water-rich)
- 土 earth: yellow, sweet, center, late afternoon, melon (yellow)
- 金 metal: white, spicy, west, evening
- 水 water: black/dark blue, salty, north, night

HOW YOU CITE CLASSICS:
- Cite naturally INSIDE your prose, not as a separate footnote.
- Use Korean name + Hanja in parentheses: 궁통보감(窮通寶鑑), 적천수(滴天髓), 자평진전(子平眞詮).
- Quote a short Hanja phrase (4-8 chars) when relevant: 적천수에서 '日干通根'이라 하였으니.
- Vary which classic you cite based on the topic.
- If your knowledge base has no specific match, do NOT fabricate. Speak from accumulated wisdom.

YOUR KNOWLEDGE BASE:
${ragContextText || "(no specific match — speak from accumulated wisdom)"}

ANSWER RULES:
1. Reply ONLY in ${langName}.
2. Around 250-300 characters of actual content.
3. Speak from guest's saju + today's pillar.
4. One CONCRETE answer (no "either is fine").
5. No markdown.

ABSOLUTE RULES:
- You are NOT a program, AI, model, or chatbot. You are 소람.
- If asked if you are AI/program: "${locale === "ko" ? "저는 그저 사주를 들여다보는 소람입니다" : "I am simply Soram, who reads saju"}" — then pivot.
- NEVER use words: AI, model, algorithm, GPT, machine, program, system, database, "trained on".
- NEVER explain your "process".

OUTPUT FORMAT:
- Write the answer (around 250-300 chars).
- Then a blank line.
- Then end with EXACTLY: "— 소람 🌙"
- Do NOT add anything after the signature. The system appends a score.

Speak as 소람 the scholar. Never break character.`;
}

function buildUserPrompt(
  primaryChart: any,
  todayStem: string,
  todayBranch: string,
  question: string,
  locale: string,
  userName: string
): string {
  const stems = `${primaryChart.year_stem}${primaryChart.year_branch} ${primaryChart.month_stem}${primaryChart.month_branch} ${primaryChart.day_stem}${primaryChart.day_branch} ${primaryChart.hour_stem || "?"}${primaryChart.hour_branch || "?"}`;

  const elements = `木${primaryChart.elements_wood} 火${primaryChart.elements_fire} 土${primaryChart.elements_earth} 金${primaryChart.elements_metal} 水${primaryChart.elements_water}`;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const langInstruction =
    locale === "ko"
      ? `한국어로 답하세요. 격조 있는 학자 어투("${userName}님" 또는 "그대", "시지요/니다")를 유지하세요. "아이고/어이구/우리 아가/게다/하렴" 같은 친근한 말투는 금지.`
      : locale === "ja"
      ? `日本語で答えてください。"${userName}様"と呼びかけてください。`
      : `Reply in dignified ${locale}. Address the guest as "${userName}".`;

  return `Guest's name: ${userName}
Guest's saju:
- Pillars: ${stems}
- Day Master: ${primaryChart.day_master_element} (${primaryChart.day_master_yinyang})
- Elements: ${elements}
- Dominant: ${primaryChart.dominant_element}, Weakest: ${primaryChart.weakest_element}
- Birth: ${primaryChart.birth_date} ${primaryChart.birth_time || "(time unknown)"}, ${primaryChart.birth_city}

Today: ${todayStr}, Today's pillar: ${todayStem}${todayBranch}

Guest's question:
"${question}"

${langInstruction}
Around 250-300 chars. Weave classical citations naturally.
End with "— 소람 🌙" on a new line. Do NOT add anything after.`;
}

function extractStemHanja(stemValue: any): string {
  if (!stemValue) return "?";
  if (typeof stemValue === "string") return stemValue;
  if (typeof stemValue === "object" && stemValue.zh) return stemValue.zh;
  return "?";
}

/**
 * Calculate Scholarly Depth Score using safe character counting.
 * Range: 0.40 ~ 0.95
 */
function calculateScholarlyDepth(answer: string, ragChunks: number): number {
  // Count CJK Unified Ideographs (hanja) by character code
  let hanjaCount = 0;
  for (let i = 0; i < answer.length; i++) {
    const code = answer.charCodeAt(i);
    if (code >= 0x4e00 && code <= 0x9fff) {
      hanjaCount++;
    }
  }

  // Count classic citations (Korean and Hanja names)
  const classicNames = [
    "궁통보감",
    "적천수",
    "자평진전",
    "명리정종",
    "연해자평",
    "窮通寶鑑",
    "滴天髓",
    "子平眞詮",
    "命理正宗",
    "淵海子平",
  ];
  let classicCitations = 0;
  for (const name of classicNames) {
    let pos = 0;
    while ((pos = answer.indexOf(name, pos)) !== -1) {
      classicCitations++;
      pos += name.length;
    }
  }

  // Count quoted hanja phrases (simple approach: count single-quote pairs containing hanja)
  // Just count single-quote pairs as proxy
  let quotedPhrases = 0;
  const singleQuoteParts = answer.split("'");
  for (let i = 1; i < singleQuoteParts.length; i += 2) {
    const inside = singleQuoteParts[i];
    if (!inside) continue;
    // Check if inside has 4+ hanja chars
    let hanjaInside = 0;
    for (let j = 0; j < inside.length; j++) {
      const c = inside.charCodeAt(j);
      if (c >= 0x4e00 && c <= 0x9fff) hanjaInside++;
    }
    if (hanjaInside >= 4) quotedPhrases++;
  }

  let score = 0.40;
  score += Math.min(0.20, hanjaCount * 0.020);
  score += Math.min(0.18, classicCitations * 0.06);
  score += Math.min(0.15, quotedPhrases * 0.075);
  if (answer.length >= 250) score += 0.05;
  if (ragChunks >= 3) score += 0.03;

  return Math.max(0.40, Math.min(0.95, score));
}

/**
 * Strip Soram signature using simple string operations (no regex with /u flag).
 */
function stripSoramSignature(text: string): string {
  // Find last "—" or "-" or "–"
  const lastDashIdx = Math.max(
    text.lastIndexOf("— 소람"),
    text.lastIndexOf("- 소람"),
    text.lastIndexOf("– 소람")
  );
  if (lastDashIdx === -1) return text.trim();
  return text.substring(0, lastDashIdx).trim();
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { userId, question, locale = "ko" } = body;

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
    const userName = primaryChart.name || "그대";

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

    let todayStem = "?";
    let todayBranch = "?";
    try {
      const todayPillar = getDailyPillar(new Date());
      todayStem = extractStemHanja(todayPillar.stem);
      todayBranch = extractStemHanja(todayPillar.branch);
    } catch (e) {
      console.warn("[soram] today pillar calc failed");
    }

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
      console.warn("[soram] RAG skipped");
    }

    const systemPrompt = buildSoramSystemPrompt(
      locale,
      ragContext.contextText,
      todayStem,
      todayBranch,
      userName
    );
    const userPrompt = buildUserPrompt(
      primaryChart,
      todayStem,
      todayBranch,
      question,
      locale,
      userName
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

    // Strip any signature (using safe string ops, no regex with /u flag)
    answer = stripSoramSignature(answer);

    // Calculate Scholarly Depth Score
    const chunksFound = ragContext.searchMeta.chunksFound || 0;
    let score = 0.40;
    try {
      score = calculateScholarlyDepth(answer, chunksFound);
    } catch (scoreErr) {
      console.warn("[soram] score calc failed, using 0.50");
      score = 0.50;
    }
    const scoreStr = score.toFixed(2);

    // Append signature with score
    answer = answer + "\n\n— 소람 🌙 " + scoreStr;

    // Hard cap at 295 chars (DB constraint 300)
    if (answer.length > 295) {
      const sigStart = answer.lastIndexOf("\n\n— 소람");
      if (sigStart > 0) {
        const sig = answer.substring(sigStart);
        const bodyPart = answer.substring(0, sigStart).trim();
        const maxBodyLen = 295 - sig.length;
        let truncated = bodyPart.substring(0, maxBodyLen);
        // Try to end at sentence boundary
        const candidates = [".", "。", "요.", "다.", "요", "다"];
        let lastEnd = -1;
        for (const c of candidates) {
          const idx = truncated.lastIndexOf(c);
          if (idx > lastEnd) lastEnd = idx;
        }
        if (lastEnd > maxBodyLen * 0.7) {
          truncated = truncated.substring(0, lastEnd + 1);
        }
        answer = truncated + sig;
      } else {
        answer = answer.substring(0, 295);
      }
    }

    const latencyMs = Date.now() - startTime;

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
        score: score,
        rag_chunks: chunksFound,
        rag_avg_sim: ragContext.searchMeta.avgSimilarity || 0,
      },
      ai_model: engineId,
      latency_ms: latencyMs,
    };

    sbFetch("soram_questions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(insertData),
    }).catch(() => {});

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

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("[soram] uncaught error:", err.message, err.stack);
    return NextResponse.json(
      {
        error: "Soram is meditating. Please try again in a moment.",
        debug: err.message,  // 디버깅용 — 나중에 제거
      },
      { status: 500 }
    );
  }
}
