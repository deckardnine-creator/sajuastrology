/**
 * POST /api/v1/primary-chart/create
 * 
 * 기본사주를 영구 저장. 계정당 1회만 가능.
 * 이미 있으면 409 Conflict.
 * 
 * Body: {
 *   userId: string,
 *   chart: SajuChart,        // BirthDataForm onCalculate에서 받은 객체
 *   cityName: string,
 *   cityLat?: number,
 *   cityLng?: number,
 *   timezone?: string,
 *   calendarType?: 'solar' | 'lunar'
 * }
 * 
 * Response:
 *   200: { ok: true, chart: SavedChart }
 *   400: { error: 'Invalid input' }
 *   409: { error: 'Already exists', existing: SavedChart }
 *   500: { error: 'Server error' }
 */

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chart, cityName, cityLat, cityLng, timezone, calendarType } = body;

    // === 1. 입력 검증 ===
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    if (!chart || !chart.name || !chart.dayMaster || !chart.pillars) {
      return NextResponse.json({ error: "Invalid chart data" }, { status: 400 });
    }
    if (!cityName) {
      return NextResponse.json({ error: "cityName required" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // === 2. 이미 존재하는지 확인 ===
    const checkRes = await sbFetch(
      `my_primary_chart?user_id=eq.${userId}&select=user_id,name,birth_date,birth_city,day_master_element,created_at`,
      { method: "GET" }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          {
            error: "Already exists",
            message: "Primary chart already saved. To update, contact support.",
            existing: existing[0],
          },
          { status: 409 }
        );
      }
    }

    // === 3. birthDate 정규화 ===
    let birthDate: Date;
    if (typeof chart.birthDate === "string") {
      birthDate = new Date(chart.birthDate);
    } else if (chart.birthDate instanceof Date) {
      birthDate = chart.birthDate;
    } else {
      // SajuChart는 Date 객체로 옴, 그러나 fetch JSON 직렬화로 string 됨
      birthDate = new Date(chart.birthDate);
    }

    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: "Invalid birth date" }, { status: 400 });
    }

    const birthDateStr = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;

    // === 4. birth_time 계산 (시간 모름이면 null) ===
    const birthHourUnknown = chart.birthHourUnknown === true;
    let birthTimeStr: string | null = null;
    if (!birthHourUnknown && typeof chart.birthHour === "number") {
      birthTimeStr = `${String(chart.birthHour).padStart(2, "0")}:00:00`;
    }

    // === 5. INSERT 데이터 준비 ===
    const insertData: Record<string, any> = {
      user_id: userId,
      name: chart.name,
      birth_date: birthDateStr,
      birth_time: birthTimeStr,
      birth_hour_unknown: birthHourUnknown,
      calendar_type: calendarType || "solar",
      gender: chart.gender,
      birth_city: cityName,
      birth_lat: cityLat || null,
      birth_lng: cityLng || null,
      timezone: timezone || null,

      // Pillars (분리 컬럼)
      year_stem: chart.pillars.year?.stem?.zh || chart.pillars.year?.stem || null,
      year_branch: chart.pillars.year?.branch?.zh || chart.pillars.year?.branch || null,
      month_stem: chart.pillars.month?.stem?.zh || chart.pillars.month?.stem || null,
      month_branch: chart.pillars.month?.branch?.zh || chart.pillars.month?.branch || null,
      day_stem: chart.pillars.day?.stem?.zh || chart.pillars.day?.stem || null,
      day_branch: chart.pillars.day?.branch?.zh || chart.pillars.day?.branch || null,
      hour_stem: chart.pillars.hour?.stem?.zh || chart.pillars.hour?.stem || null,
      hour_branch: chart.pillars.hour?.branch?.zh || chart.pillars.hour?.branch || null,

      day_master_element: chart.dayMaster?.element || null,
      day_master_yinyang: chart.dayMaster?.yinYang || null,
      dominant_element: chart.dominantElement || null,
      weakest_element: chart.weakestElement || null,

      elements_wood: chart.elements?.wood ?? 0,
      elements_fire: chart.elements?.fire ?? 0,
      elements_earth: chart.elements?.earth ?? 0,
      elements_metal: chart.elements?.metal ?? 0,
      elements_water: chart.elements?.water ?? 0,

      archetype: chart.archetype || null,
      ten_god: chart.tenGod || null,
      harmony_score: chart.harmonyScore || null,

      // 백업: 전체 SajuChart 객체 (미래 필드 추가에 대비)
      raw_chart: chart,
    };

    // === 6. INSERT ===
    const insertRes = await sbFetch("my_primary_chart", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(insertData),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text().catch(() => "unknown");
      console.error("[primary-chart/create] DB insert failed:", insertRes.status, errText);

      // unique constraint violation → 409
      if (insertRes.status === 409 || errText.includes("duplicate") || errText.includes("unique")) {
        return NextResponse.json(
          {
            error: "Already exists",
            message: "Primary chart already saved. To update, contact support.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: `DB insert failed (${insertRes.status})` },
        { status: 500 }
      );
    }

    const inserted = await insertRes.json();
    const result = Array.isArray(inserted) ? inserted[0] : inserted;

    return NextResponse.json({
      ok: true,
      chart: {
        user_id: result.user_id,
        name: result.name,
        birth_date: result.birth_date,
        birth_city: result.birth_city,
        day_master_element: result.day_master_element,
        created_at: result.created_at,
      },
    });
  } catch (err: any) {
    console.error("[primary-chart/create] error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
