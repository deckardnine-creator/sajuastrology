/**
 * POST /api/v1/soram/history
 *
 * Body: {
 *   userId: string,
 *   before?: string,    // ISO datetime - get messages older than this (cursor)
 *   limit?: number,     // default 30, max 50
 * }
 *
 * Response:
 *   200: {
 *     messages: Array<{
 *       id: string,
 *       question: string,
 *       answer: string,
 *       createdAt: string,
 *       score: number,
 *     }>,
 *     hasMore: boolean,
 *     oldestCursor: string | null,
 *   }
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, before, limit = 30 } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    const safeLimit = Math.min(Math.max(1, Number(limit) || 30), 50);

    // Fetch latest first (descending), then reverse client-side for chat order
    let query = `soram_questions?user_id=eq.${userId}&select=id,question,answer,created_at,primary_chart_snapshot&order=created_at.desc&limit=${safeLimit + 1}`;
    if (before && typeof before === "string") {
      query += `&created_at=lt.${encodeURIComponent(before)}`;
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    const rawData = (await res.json()) as Array<any>;
    if (!Array.isArray(rawData)) {
      return NextResponse.json({
        messages: [],
        hasMore: false,
        oldestCursor: null,
      });
    }

    const hasMore = rawData.length > safeLimit;
    const trimmed = hasMore ? rawData.slice(0, safeLimit) : rawData;

    // Convert to client format - reverse so oldest first (chat scroll order)
    const messages = trimmed
      .map((row) => {
        let score = 0.5;
        try {
          const snap = row.primary_chart_snapshot;
          if (snap && typeof snap === "object") {
            if (typeof snap.score === "number") score = snap.score;
            else if (typeof snap.rag_score === "number") score = snap.rag_score;
          }
        } catch {}
        return {
          id: String(row.id),
          question: row.question || "",
          answer: row.answer || "",
          createdAt: row.created_at,
          score,
        };
      })
      .reverse();

    const oldestCursor = trimmed.length > 0
      ? trimmed[trimmed.length - 1].created_at
      : null;

    return NextResponse.json({
      messages,
      hasMore,
      oldestCursor,
    });
  } catch (err: any) {
    console.error("[soram/history] error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
