import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const cols = "id,category,initial_question,report_title,report,status,created_at";
    const res = await fetch(
      `${supabaseUrl}/rest/v1/consultations?user_id=eq.${userId}&status=eq.completed&select=${cols}&order=created_at.desc&limit=10`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ consultations: [] });
    }

    const data = await res.json();
    return NextResponse.json({ consultations: data || [] });
  } catch {
    return NextResponse.json({ consultations: [] });
  }
}
