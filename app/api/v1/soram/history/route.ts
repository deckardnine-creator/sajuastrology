/**
 * POST /api/v1/soram/history
 *
 * Body: {
 *   userId: string,
 *   before?: string,    // ISO datetime - get messages older than this (cursor)
 *   limit?: number,     // default 30, max 50
 * }
 *
 * Response (always 200, never throws to client):
 *   {
 *     messages: Array<{
 *       id: string,
 *       question: string,
 *       answer: string,
 *       createdAt: string,
 *       score: number,
 *     }>,
 *     hasMore: boolean,
 *     oldestCursor: string | null,
 *     _debug?: { ... }   // only when SORAM_DEBUG=1
 *   }
 *
 * v6.17.61 — chandler reported: "deckardnine@gmail.com 으로 어제 보낸
 * 메시지가 새 세션에서 안 보임". Supabase has the row (verified via SQL),
 * but the client gets an empty list. Root cause unknown without server
 * logs, so this revision:
 *   1. Logs the exact Supabase query + response status + response body
 *      on every call (Vercel logs will reveal the failure mode).
 *   2. NEVER returns 500 to the client — always returns {messages: []}
 *      with diagnostic info. The chat UI then falls through to "no
 *      messages yet" instead of breaking silently.
 *   3. Tolerates malformed primary_chart_snapshot (the previous
 *      revision could throw inside the .map() if snapshot was a
 *      string instead of object).
 *   4. Returns _debug field when SORAM_DEBUG=1 env var is set.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const debugMode = process.env.SORAM_DEBUG === "1";

export async function POST(request: NextRequest) {
  // Always-200 envelope — even on internal failure we return an empty
  // list so the chat UI gracefully shows the welcome screen.
  const emptyResponse = (debug?: any) => {
    const body: any = {
      messages: [],
      hasMore: false,
      oldestCursor: null,
    };
    if (debugMode && debug) body._debug = debug;
    return NextResponse.json(body);
  };

  try {
    const body = await request.json();
    const { userId, before, limit = 30 } = body;

    if (!userId || typeof userId !== "string") {
      console.warn("[soram/history] bad request: missing userId");
      return emptyResponse({ reason: "missing_user_id" });
    }
    if (!supabaseUrl || !supabaseKey) {
      console.error("[soram/history] env missing: SUPABASE_URL or KEY");
      return emptyResponse({ reason: "env_missing" });
    }

    const safeLimit = Math.min(Math.max(1, Number(limit) || 30), 50);

    let query = `soram_questions?user_id=eq.${userId}&select=id,question,answer,created_at,primary_chart_snapshot&order=created_at.desc&limit=${safeLimit + 1}`;
    if (before && typeof before === "string") {
      query += `&created_at=lt.${encodeURIComponent(before)}`;
    }

    const fullUrl = `${supabaseUrl}/rest/v1/${query}`;
    const startedAt = Date.now();

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const elapsedMs = Date.now() - startedAt;

    // ALWAYS log Supabase response status so Vercel logs reveal
    // the failure mode if user reports empty history.
    console.log(
      `[soram/history] userId=${userId.substring(0, 8)}... ` +
        `status=${res.status} elapsed=${elapsedMs}ms ` +
        `limit=${safeLimit + 1}`
    );

    if (!res.ok) {
      let errorBody = "";
      try {
        errorBody = await res.text();
      } catch {}
      console.error(
        `[soram/history] supabase error status=${res.status} body=${errorBody.substring(0, 500)}`
      );
      return emptyResponse({
        reason: "supabase_error",
        status: res.status,
        errorBody: errorBody.substring(0, 500),
      });
    }

    let rawData: any;
    try {
      rawData = await res.json();
    } catch (parseErr: any) {
      console.error("[soram/history] json parse failed:", parseErr.message);
      return emptyResponse({ reason: "json_parse_failed" });
    }

    if (!Array.isArray(rawData)) {
      console.warn(
        "[soram/history] non-array response from supabase:",
        typeof rawData
      );
      return emptyResponse({
        reason: "non_array_response",
        type: typeof rawData,
      });
    }

    console.log(
      `[soram/history] fetched ${rawData.length} rows for userId=${userId.substring(0, 8)}...`
    );

    const hasMore = rawData.length > safeLimit;
    const trimmed = hasMore ? rawData.slice(0, safeLimit) : rawData;

    // Convert to client format - reverse so oldest first
    const messages = trimmed
      .map((row: any) => {
        // v6.17.61 — defensive: snapshot could be null, string, or
        // any shape. Don't let one bad row break the entire list.
        let score = 0.5;
        try {
          const snap = row.primary_chart_snapshot;
          if (snap && typeof snap === "object") {
            if (typeof snap.score === "number") score = snap.score;
            else if (typeof snap.rag_score === "number") score = snap.rag_score;
          }
        } catch {
          // snap malformed — fall through to default 0.5
        }
        return {
          id: String(row.id),
          question: row.question || "",
          answer: row.answer || "",
          createdAt: row.created_at,
          score,
        };
      })
      .reverse();

    const oldestCursor =
      trimmed.length > 0 ? trimmed[trimmed.length - 1].created_at : null;

    const response: any = {
      messages,
      hasMore,
      oldestCursor,
    };
    if (debugMode) {
      response._debug = {
        rawCount: rawData.length,
        returnedCount: messages.length,
        elapsedMs,
      };
    }
    return NextResponse.json(response);
  } catch (err: any) {
    console.error(
      "[soram/history] unexpected error:",
      err.message,
      err.stack?.substring(0, 500)
    );
    return emptyResponse({
      reason: "unexpected_exception",
      message: err.message,
    });
  }
}
