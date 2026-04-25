/**
 * POST /api/v1/soram/ask
 * 
 * Ask Soram에게 200자 질문 → 200자 답변 받기
 * 
 * 요청: { question: string }
 * 응답: { answer, tone, category, dailyRemaining, questionId }
 * 에러: 401 (미인증), 403 (기본사주 없음), 429 (리밋 초과), 500 (AI 실패)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSoramAnswer, SoramAIError } from "@/lib/soram-ai-router";

// Service role 클라이언트 (서버 사이드 전용)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// User session 클라이언트
async function getAuthedClient(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) return null;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

export async function POST(req: NextRequest) {
  try {
    // ============= 1. 인증 =============
    const authed = await getAuthedClient(req);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = authed;
    
    // ============= 2. 요청 검증 =============
    const body = await req.json();
    const question = (body.question || "").trim();
    const locale = (body.locale || "en") as "en" | "ko" | "ja";
    
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    if (question.length > 200) {
      return NextResponse.json({ error: "Question too long (max 200 chars)" }, { status: 400 });
    }
    
    const service = getServiceClient();
    
    // ============= 3. 기본사주 확인 =============
    const { data: chart } = await service
      .from("my_primary_chart")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (!chart) {
      return NextResponse.json({ 
        error: "Primary chart required",
        redirect: "/setup-primary-chart"
      }, { status: 403 });
    }
    
    // ============= 4. 레이트 리밋 체크 =============
    const { data: canAsk } = await service.rpc("can_ask_soram_today", { p_user_id: userId });
    if (!canAsk) {
      const { data: tier } = await service.rpc("get_soram_user_tier", { p_user_id: userId });
      return NextResponse.json({
        error: "Daily limit reached",
        tier,
        message: locale === "ko" 
          ? "오늘 대화는 여기까지예요. 내일 만나요." 
          : locale === "ja"
          ? "今日の対話はここまでです。また明日。"
          : "We've talked enough today. See you tomorrow."
      }, { status: 429 });
    }
    
    // ============= 5. 최근 컨텍스트 로드 =============
    const { data: recentQA } = await service
      .from("soram_questions")
      .select("question, answer")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);
    
    // ============= 6. 오늘 천간지지 계산 =============
    // TODO: 기존 saju-calculator 사용
    const todayPillar = calculateTodayPillar(new Date());
    
    // ============= 7. AI 답변 생성 =============
    let aiResult;
    try {
      aiResult = await generateSoramAnswer({
        question,
        primaryChart: chart,
        todayPillar,
        recentContext: recentQA || [],
        locale,
      });
    } catch (e) {
      if (e instanceof SoramAIError) {
        // AI 실패 시 레이트 리밋 차감 안 함
        return NextResponse.json({
          error: "AI temporarily unavailable",
          message: locale === "ko"
            ? "소람이 잠시 길을 잃었어요. 다시 불러주세요."
            : locale === "ja"
            ? "ソラムが一時的に道を見失いました。もう一度試してください。"
            : "Soram is taking a moment. Please try again.",
        }, { status: 503 });
      }
      throw e;
    }
    
    // ============= 8. DB 저장 =============
    const { data: saved, error: saveError } = await service
      .from("soram_questions")
      .insert({
        user_id: userId,
        question,
        answer: aiResult.answer,
        locale,
        primary_chart_snapshot: {
          day_master: chart.day_master,
          elements: chart.elements,
        },
        today_pillar: todayPillar,
        recent_context: recentQA?.slice(0, 3),
        category: aiResult.category,
        tone: aiResult.tone,
        emotional_signal: aiResult.emotional_signal,
        ai_model: aiResult.ai_model,
        ai_attempt_count: aiResult.ai_attempt_count,
        tokens_used: aiResult.tokens_used,
        latency_ms: aiResult.latency_ms,
      })
      .select("id")
      .single();
    
    if (saveError) {
      console.error("[soram-ask] DB save failed:", saveError);
      // 저장 실패해도 답변은 반환
    }
    
    // ============= 9. 레이트 리밋 카운트 +1 =============
    const today = new Date().toISOString().split("T")[0];
    const { data: tierData } = await service.rpc("get_soram_user_tier", { p_user_id: userId });
    
    await service
      .from("soram_rate_limit")
      .upsert({
        user_id: userId,
        ask_date: today,
        count: 1,
        tier: tierData || "free",
      }, {
        onConflict: "user_id,ask_date",
        ignoreDuplicates: false,
      });
    
    // 기존 row가 있으면 increment
    await service.rpc("increment_soram_count", { 
      p_user_id: userId, 
      p_date: today 
    }).select(); // 함수 없어도 무시
    
    // ============= 10. 응답 =============
    return NextResponse.json({
      questionId: saved?.id,
      answer: aiResult.answer,
      tone: aiResult.tone,
      category: aiResult.category,
      tier: tierData,
      dailyRemaining: tierData === "subscriber" ? -1 : 0, // -1 = unlimited
    });
    
  } catch (e: any) {
    console.error("[soram-ask] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// 임시 스텁 — 실제로는 lib/saju-calculator.ts에서 import
function calculateTodayPillar(date: Date): any {
  // TODO: import { calculateDayPillar } from "@/lib/saju-calculator";
  return { day: "甲子", element: "wood" };
}
