/**
 * POST /api/v1/soram/usage
 *
 * Body: { userId: string }
 *
 * Response:
 *   200: {
 *     tier: "free" | "subscriber",
 *     canAskToday: boolean,
 *     remainingToday: number,
 *     subscriptionEnd: string | null,
 *     hasPrimaryChart: boolean,
 *     userName: string | null,
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

    // 1. tier (free / subscriber)
    let tier: "free" | "subscriber" = "free";
    let subscriptionEnd: string | null = null;
    try {
      const tierRes = await sbRpc("get_soram_user_tier", { p_user_id: userId });
      if (tierRes.ok) {
        const t = await tierRes.json();
        if (typeof t === "string" && t === "subscriber") tier = "subscriber";
      }
    } catch {}

    // 2. subscription end (if subscriber)
    if (tier === "subscriber") {
      try {
        const subRes = await sbFetch(
          `soram_subscriptions?user_id=eq.${userId}&status=eq.active&select=current_period_end`,
          { method: "GET" }
        );
        if (subRes.ok) {
          const data = await subRes.json();
          if (Array.isArray(data) && data.length > 0) {
            subscriptionEnd = data[0].current_period_end;
          }
        }
      } catch {}
    }

    // 3. canAskToday
    let canAskToday = true;
    let remainingToday = tier === "subscriber" ? 999 : 1;

    if (tier === "free") {
      try {
        const canAskRes = await sbRpc("can_ask_soram_today", { p_user_id: userId });
        if (canAskRes.ok) {
          const can = await canAskRes.json();
          canAskToday = can !== false;
          remainingToday = canAskToday ? 1 : 0;
        }
      } catch {}
    }

    // 4. primary chart + userName
    let hasPrimaryChart = false;
    let userName: string | null = null;
    try {
      const chartRes = await sbFetch(
        `my_primary_chart?user_id=eq.${userId}&select=name`,
        { method: "GET" }
      );
      if (chartRes.ok) {
        const data = await chartRes.json();
        if (Array.isArray(data) && data.length > 0) {
          hasPrimaryChart = true;
          userName = data[0].name || null;
        }
      }
    } catch {}

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
