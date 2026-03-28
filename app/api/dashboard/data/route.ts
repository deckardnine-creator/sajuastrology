import { NextRequest, NextResponse } from "next/server";

const READING_COLS = "id,name,gender,birth_date,birth_city,share_slug,archetype,ten_god,harmony_score,day_master_element,day_master_yinyang,dominant_element,weakest_element,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,is_paid,created_at";
const COMPAT_COLS = "id,person_a_name,person_b_name,person_a_element,person_b_element,overall_score,share_slug,created_at";

export async function POST(request: NextRequest) {
  try {
    const { userId, claimCompatSlugs, claimCompatName } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    // Claim compat results if requested (fire-and-forget style)
    if (claimCompatSlugs && Array.isArray(claimCompatSlugs)) {
      for (const slug of claimCompatSlugs) {
        await fetch(
          `${supabaseUrl}/rest/v1/compatibility_results?share_slug=eq.${encodeURIComponent(slug)}&user_id=is.null`,
          {
            method: "PATCH",
            headers: { ...headers, Prefer: "return=minimal" },
            body: JSON.stringify({ user_id: userId }),
          }
        ).catch(() => {});
      }
    }

    // Claim by name match
    if (claimCompatName) {
      await fetch(
        `${supabaseUrl}/rest/v1/compatibility_results?person_a_name=eq.${encodeURIComponent(claimCompatName)}&user_id=is.null`,
        {
          method: "PATCH",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({ user_id: userId }),
        }
      ).catch(() => {});
    }

    // Fetch readings
    const readingsRes = await fetch(
      `${supabaseUrl}/rest/v1/readings?user_id=eq.${userId}&select=${READING_COLS}&order=created_at.desc&limit=20`,
      { headers }
    );
    const readings = readingsRes.ok ? await readingsRes.json() : [];

    // Fetch compat results
    const compatRes = await fetch(
      `${supabaseUrl}/rest/v1/compatibility_results?user_id=eq.${userId}&select=${COMPAT_COLS}&order=created_at.desc&limit=10`,
      { headers }
    );
    const compat = compatRes.ok ? await compatRes.json() : [];

    return NextResponse.json({ readings: readings || [], compat: compat || [] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
