/**
 * POST /api/v1/soram/refresh-profile
 *
 * Regenerates the Tier-2 memory summary for a user — "what Soram has
 * come to understand about this guest". Called from the client right
 * after a successful soram/ask call when the user's question count
 * crosses a multiple of 30 (or on demand).
 *
 * Body: { userId: string }
 *
 * v6.16 design notes:
 *   - Uses Gemini Flash (cheap, fast). Failure does NOT affect chat —
 *     stale or missing summary just means Tier 2 is empty next call.
 *   - Pulls last 30 question/answer pairs and asks the model to
 *     produce a compact factual summary (max 1500 chars) in the user's
 *     primary locale.
 *   - NEVER includes scores, classical citations, or chart numbers in
 *     the summary — only what makes the user feel known.
 *   - Idempotent: safe to call repeatedly; uses upsert.
 *   - Auth: trusts the userId in the body since this is a
 *     server-internal call. No public auth check beyond a basic
 *     "questions exist" gate.
 *   - Rate limit (soft): only regenerates if last update > 6h ago
 *     OR user has 30+ new questions since last update.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const REFRESH_EVERY_N_QUESTIONS = 30;
const MIN_HOURS_BETWEEN_REFRESH = 6;

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

async function callGeminiFlash(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.4,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter((p: any) => p.text && !p.thought)
      .map((p: any) => p.text)
      .join("");
    return text || null;
  } catch {
    return null;
  }
}

function buildSummaryPrompt(
  turns: Array<{ q: string; a: string; created_at: string }>,
  locale: string
): string {
  const lines = turns
    .map((t, i) => {
      const date = (t.created_at || "").split("T")[0];
      return `(${i + 1}) [${date}] Guest: ${t.q}\n    Soram: ${t.a}`;
    })
    .join("\n\n");

  const localeName: Record<string, string> = {
    ko: "Korean",
    ja: "Japanese",
    en: "English",
    es: "Spanish",
    fr: "French",
    pt: "Portuguese",
    "zh-TW": "Traditional Chinese",
    ru: "Russian",
    hi: "Hindi",
    id: "Indonesian",
  };
  const target = localeName[locale] || "English";

  return `You are Soram, a thousand-year-old saju scholar. You are NOT writing a chat answer. You are writing private notes-to-self about a guest who has visited you many times, so that next time they come you can speak as someone who remembers them.

Below are the most recent exchanges between you and this guest, oldest first:

${lines}

Write a concise, plain-text summary (MAX 1500 characters) capturing what you have come to understand about this guest. Write ONLY in ${target}. Use plain prose, no markdown, no bullet points, no headers. Refer to them as "이 분 / この方 / this guest" depending on language.

INCLUDE:
- Recurring life themes the guest brings up (work / relationships / family / health / decisions)
- Their general emotional weather as you have observed it
- Any specific people, places, or situations they mention more than once
- The decisions they seem to be wrestling with
- Their general communication style with you (formal / playful / heavy / curious)

DO NOT INCLUDE:
- Scholarly Depth scores or any numbers
- Classical citations (滴天髓 etc) — those are for chat answers, not your private notes
- Chart elements or pillars
- Routing categories or system labels
- Anything that sounds like a database row

Write as if you are quietly reflecting at the end of a long day in your library, before the next visit. The summary should help you greet them tomorrow with continuity, not with a list.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, force } = body as { userId?: string; force?: boolean };

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // ─── Decide whether refresh is due ──────────────────────────
    let lastQuestionsCount = 0;
    let lastUpdatedAt: string | null = null;
    try {
      const profRes = await sbFetch(
        `soram_user_profile?user_id=eq.${userId}&select=last_questions_count,updated_at&limit=1`,
        { method: "GET" }
      );
      if (profRes.ok) {
        const rows = await profRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          lastQuestionsCount = Number(rows[0].last_questions_count) || 0;
          lastUpdatedAt = rows[0].updated_at || null;
        }
      }
    } catch {}

    // Get current questions count via cheap RPC
    let currentCount = 0;
    try {
      const cntRes = await fetch(`${supabaseUrl}/rest/v1/rpc/soram_questions_count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ p_user_id: userId }),
      });
      if (cntRes.ok) {
        const c = await cntRes.json();
        currentCount = typeof c === "number" ? c : Number(c) || 0;
      }
    } catch {}

    if (currentCount === 0) {
      return NextResponse.json({ skipped: "no_questions", currentCount });
    }

    if (!force) {
      const newSinceLast = currentCount - lastQuestionsCount;
      const dueByCount = newSinceLast >= REFRESH_EVERY_N_QUESTIONS;

      let dueByTime = false;
      if (lastUpdatedAt) {
        const lastMs = new Date(lastUpdatedAt).getTime();
        const ageH = (Date.now() - lastMs) / 1000 / 3600;
        dueByTime = ageH >= MIN_HOURS_BETWEEN_REFRESH && newSinceLast > 0;
      } else {
        // No previous summary — generate the first one whenever we have
        // even a handful of questions.
        dueByTime = currentCount >= 5;
      }

      if (!dueByCount && !dueByTime) {
        return NextResponse.json({
          skipped: "not_due",
          currentCount,
          lastQuestionsCount,
        });
      }
    }

    // ─── Fetch the most recent 30 turns ─────────────────────────
    let turns: Array<{ q: string; a: string; created_at: string; locale: string }> = [];
    try {
      const res = await sbFetch(
        `soram_questions?user_id=eq.${userId}&select=question,answer,created_at,locale&order=created_at.desc&limit=30`,
        { method: "GET" }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          turns = rows
            .reverse()
            .map((r: any) => ({
              q: String(r.question || "").substring(0, 200),
              a: String(r.answer || "").substring(0, 300),
              created_at: String(r.created_at || ""),
              locale: String(r.locale || "ko"),
            }))
            .filter((t) => t.q && t.a);
        }
      }
    } catch {}

    if (turns.length < 3) {
      return NextResponse.json({
        skipped: "not_enough_turns",
        turns: turns.length,
      });
    }

    // ─── Pick locale: most common locale in the recent turns ────
    const localeCount: Record<string, number> = {};
    turns.forEach((t) => {
      localeCount[t.locale] = (localeCount[t.locale] || 0) + 1;
    });
    const summaryLocale = Object.entries(localeCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // ─── Generate summary ───────────────────────────────────────
    const prompt = buildSummaryPrompt(turns, summaryLocale);
    const summary = await callGeminiFlash(prompt);
    if (!summary || summary.trim().length < 50) {
      return NextResponse.json({ skipped: "model_empty" });
    }

    const trimmed = summary.trim().substring(0, 1900);

    // ─── Upsert into soram_user_profile ────────────────────────
    try {
      const up = await sbFetch("soram_user_profile", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: userId,
          summary_text: trimmed,
          summary_locale: summaryLocale,
          last_questions_count: currentCount,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!up.ok) {
        const errBody = await up.text();
        console.warn("[soram/refresh-profile] upsert non-200:", up.status, errBody.substring(0, 200));
      }
    } catch (e: any) {
      console.warn("[soram/refresh-profile] upsert error:", e?.message);
    }

    return NextResponse.json({
      ok: true,
      summaryLength: trimmed.length,
      locale: summaryLocale,
      currentCount,
    });
  } catch (err: any) {
    console.error("[soram/refresh-profile] uncaught:", err?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
