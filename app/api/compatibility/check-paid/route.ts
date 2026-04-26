// ════════════════════════════════════════════════════════════════════
// /api/compatibility/check-paid — return is_paid status for a slug.
// ════════════════════════════════════════════════════════════════════
// v6.15 ADDS this endpoint instead of modifying /api/compatibility/get
// per chandler's "never modify existing functions, append only" rule.
//
// The result page calls this once on mount and again after returning
// from PayPal. Tiny payload (1 boolean) so polling is cheap.
//
// Edge runtime for fast response from anywhere in the world.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug } = await request.json();
    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(
        shareSlug
      )}&select=is_paid&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ is_paid: false });
    }

    const rows = await res.json();
    const isPaid = !!(rows?.[0]?.is_paid);
    return NextResponse.json({ is_paid: isPaid });
  } catch {
    return NextResponse.json({ is_paid: false });
  }
}
