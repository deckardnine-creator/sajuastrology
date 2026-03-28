import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { shareSlug } = await request.json();
    if (!shareSlug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const res = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(shareSlug)}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ result: data[0] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
