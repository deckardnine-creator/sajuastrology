/**
 * POST /api/v1/primary-chart/get
 * 
 * 본인의 기본사주 조회.
 * 
 * Body: { userId: string }
 * 
 * Response:
 *   200: { chart: SavedChart | null }
 *   400: { error: 'userId required' }
 *   500: { error: 'Server error' }
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/my_primary_chart?user_id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown");
      console.error("[primary-chart/get] DB query failed:", res.status, errText);
      return NextResponse.json(
        { error: `DB query failed (${res.status})` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const chart = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json({ chart });
  } catch (err: any) {
    console.error("[primary-chart/get] error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
