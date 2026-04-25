/**
 * POST /api/v1/soram/usage
 * 
 * 소람 사용 가능 상태 조회.
 * Body: { userId: string }
 * 
 * Response:
 *   200: {
 *     tier: "free" | "subscriber",
 *     canAskToday: boolean,
 *     remainingToday: number,  // free: 1 or 0, subscriber: 999
 *     subscriptionEnd: string | null,
 *     hasPrimaryChart: boolean,
 *     userName: string | null,
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

async function sbFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
    }

    // 1. Primary chart 존재 + 이름
    const chartRes = await sbFetch(
      `my_primary_chart?user_id=eq.${userId}&select=name`
    );
    const chartData = chartRes.ok ? await chartRes.json() : [];
    const hasPrimaryChart = Array.isArray(chartData) && chartData.length > 0;
    const userName = hasPrimaryChart ? chartData[0].name : null;

    // 2. Tier 판별
    const tierRes = await sbRpc("get_soram_user_tier", { p_user_id: userId });
    const tierData = tierRes.ok ? await tierRes.json() : "free";
    const tier: "free" | "subscriber" =
      typeof tierData === "string" && tierData === "subscriber"
        ? "subscriber"
        : "free";

    // 3. Subscriber인 경우 만료일 조회
    let subscriptionEnd: string | null = null;
    if (tier === "subscriber") {
      const subRes = await sbFetch(
        `soram_subscriptions?user_id=eq.${userId}&status=eq.active&select=current_period_end&order=current_period_end.desc&limit=1`
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        if (Array.isArray(subData) && subData.length > 0) {
          subscriptionEnd = subData[0].current_period_end;
        }
      }
    }

    // 4. 오늘 질문 가능 여부 + 남은 횟수
    let canAskToday = true;
    let remainingToday = 999;

    if (tier === "free") {
      const canAskRes = await sbRpc("can_ask_soram_today", { p_user_id: userId });
      canAskToday = canAskRes.ok ? await canAskRes.json() : true;
      remainingToday = canAskToday ? 1 : 0;
    }

    return NextResponse.json({
      tier,
      canAskToday,
      remainingToday,
      subscriptionEnd,
      hasPrimaryChart,
      userName,
    });
  } catch (err: any) {
    console.error("[soram/usage] error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
