import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

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

// Flutter app endpoint — fetch compatibility result by shareSlug
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shareSlug } = body;

    if (!shareSlug) {
      return NextResponse.json({ error: "Missing shareSlug" }, { status: 400 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?${new URLSearchParams({
        share_slug: `eq.${shareSlug}`,
        select: "person_a_name,person_b_name,person_a_gender,person_b_gender,person_a_day_master,person_b_day_master,person_a_element,person_b_element,overall_score,love_score,work_score,friendship_score,conflict_score,free_summary,share_slug",
        limit: "1",
      })}`,
      { headers: dbHeaders }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      success: true,
      result: {
        personA: {
          name: row.person_a_name,
          gender: row.person_a_gender,
          dayMaster: row.person_a_day_master,
          element: row.person_a_element,
        },
        personB: {
          name: row.person_b_name,
          gender: row.person_b_gender,
          dayMaster: row.person_b_day_master,
          element: row.person_b_element,
        },
        scores: {
          overall: row.overall_score,
          love: row.love_score,
          work: row.work_score,
          friendship: row.friendship_score,
          conflict: row.conflict_score,
        },
        freeSummary: (() => { try { const parsed = JSON.parse(row.free_summary || '{}'); return parsed.summary || parsed.free_summary || row.free_summary || ''; } catch { return row.free_summary || ''; } })(),
        shareSlug: row.share_slug,
      },
    });
  } catch (err: any) {
    console.error("compatibility get-app error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
