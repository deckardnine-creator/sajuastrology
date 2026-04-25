/**
 * POST /api/v1/soram/history
 * 
 * 소람 채팅 과거 메시지 페이지네이션 조회.
 * 카카오톡식 — 가장 오래된 게 위, 최신이 아래.
 * 
 * Body: { 
 *   userId: string, 
 *   before?: string,   // ISO datetime — 이 시간 이전의 메시지 가져오기 (스크롤 업)
 *   limit?: number,    // default 30, max 50
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
 *     hasMore: boolean,   // 더 오래된 메시지가 있는지
 *     oldestCursor: string | null,  // 다음 페이지 요청용
 *   }
 *   400: { error: 'userId required' }
 *   500: { error: 'Server error' }
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

async function sbFetch(path: string) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
}

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
    // +1 fetched to detect hasMore
    const fetchLimit = safeLimit + 1;

    // Build query: most recent first, then we reverse for chat order
    let query = `soram_questions?user_id=eq.${userId}&select=id,question,answer,created_at,primary_chart_snapshot&order=created_at.desc&limit=${fetchLimit}`;
    if (before && typeof before === "string") {
      query += `&created_at=lt.${encodeURIComponent(before)}`;
    }

    const res = await sbFetch(query);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[soram/history] supabase error:", errText.substring(0, 200));
      return NextResponse.json({ error: "Service error" }, { status: 500 });
    }

    const data = await res.json();
    const rows = Array.isArray(data) ? data : [];

    const hasMore = rows.length > safeLimit;
    const trimmed = hasMore ? rows.slice(0, safeLimit) : rows;

    // Reverse so oldest is first (chat order: top = old, bottom = new)
    const ordered = [...trimmed].reverse();

    const messages = ordered.map((row: any) => {
      const snapshot = row.primary_chart_snapshot || {};
      const score = typeof snapshot.score === "number" 
        ? snapshot.score 
        : (typeof snapshot.rag_score === "number" ? snapshot.rag_score : 0.5);
      return {
        id: row.id,
        question: row.question,
        answer: row.answer,
        createdAt: row.created_at,
        score: score,
      };
    });

    // oldestCursor = the oldest message in trimmed set (not in ordered, but same data)
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
