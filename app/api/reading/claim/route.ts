import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug, userId } = await request.json();

    if (!shareSlug || !userId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    const dbHeaders = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    // 1. Fetch the reading to claim — must exist and be unclaimed
    const readingRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&user_id=is.null&select=name,birth_date`,
      { headers: dbHeaders }
    );
    if (!readingRes.ok) {
      return NextResponse.json({ error: "Claim failed" }, { status: 500 });
    }
    const readings = await readingRes.json();
    if (!readings || readings.length === 0) {
      // Already claimed or doesn't exist — not an error, just no-op
      return NextResponse.json({ success: true, alreadyClaimed: true });
    }

    const target = readings[0];

    // 2. Verify ownership: user must have an existing reading with same name + birth_date
    //    OR this must be a very recent reading (within 2 hours — covers first-time generation)
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const verifyRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?user_id=eq.${userId}&name=eq.${encodeURIComponent(target.name)}&birth_date=eq.${target.birth_date}&select=id&limit=1`,
      { headers: dbHeaders }
    );
    const userReadings = verifyRes.ok ? await verifyRes.json() : [];

    // Also check if the target reading was created recently (first-time claim)
    const recentRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&created_at=gte.${cutoff}&select=id&limit=1`,
      { headers: dbHeaders }
    );
    const recentReadings = recentRes.ok ? await recentRes.json() : [];

    if ((!userReadings || userReadings.length === 0) && (!recentReadings || recentReadings.length === 0)) {
      // No matching reading found for this user AND reading is not recent
      return NextResponse.json({ error: "Cannot claim this reading" }, { status: 403 });
    }

    // 3. Safe to claim
    const res = await fetch(
      `${supabaseUrl}/rest/v1/readings?share_slug=eq.${shareSlug}&user_id=is.null`,
      {
        method: "PATCH",
        headers: { ...dbHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Claim failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
