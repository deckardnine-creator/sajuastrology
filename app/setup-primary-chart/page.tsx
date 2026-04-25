"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { BirthDataForm } from "@/components/calculate/birth-data-form";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import type { SajuChart } from "@/lib/saju-calculator";

type Phase = "loading" | "form" | "confirm" | "saving" | "success" | "error";

interface PendingData {
  chart: SajuChart;
  cityName: string;
}

export default function SetupPrimaryChartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useLanguage();

  const [phase, setPhase] = useState<Phase>("loading");
  const [pending, setPending] = useState<PendingData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ============= 1. 로그인 + 기존 chart 체크 =============
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // 비로그인 → 홈으로
      router.replace("/");
      return;
    }

    // 이미 저장된 사주 있으면 바로 dashboard로
    (async () => {
      try {
        const res = await fetch("/api/v1/primary-chart/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data?.chart) {
          // 이미 저장됨 → 대시보드로
          router.replace("/dashboard");
          return;
        }
        setPhase("form");
      } catch (e) {
        console.error("[setup] check error:", e);
        setPhase("form");
      }
    })();
  }, [user, authLoading, router]);

  // ============= 2. BirthDataForm 결과 처리 =============
  const handleCalculate = (chart: SajuChart, cityName: string) => {
    setPending({ chart, cityName });
    setPhase("confirm");
    // 스크롤 맨 위로 (모바일에서 모달 보이게)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ============= 3. 컨펌 → 저장 =============
  const handleConfirm = async () => {
    if (!pending || !user) return;
    setPhase("saving");
    setErrorMsg("");

    try {
      // Find city full info from cities-data
      const { searchCities } = await import("@/lib/cities-data");
      const cityResults = searchCities(pending.cityName);
      const cityInfo = cityResults.find((c) => c.name === pending.cityName) || cityResults[0];

      const res = await fetch("/api/v1/primary-chart/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          chart: pending.chart,
          cityName: pending.cityName,
          cityLat: cityInfo?.latitude,
          cityLng: cityInfo?.longitude,
          timezone: cityInfo?.timezone,
          calendarType: "solar",
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // 이미 있음 → 대시보드로
        router.replace("/dashboard");
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save. Please try again.");
        setPhase("error");
        return;
      }

      setPhase("success");

      // 3초 후 dashboard로 자동 이동
      setTimeout(() => {
        router.replace("/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error("[setup] save error:", err);
      setErrorMsg(err.message || "Network error");
      setPhase("error");
    }
  };

  const handleCancel = () => {
    setPhase("form");
    setPending(null);
  };

  // ============= 로딩 화면 =============
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ============= 입력 폼 =============
  if (phase === "form") {
    return (
      <div className="relative">
        {/* ════════════════════════════════════════════════════════
            v6.5: Soram-narrated lock notice — INLINE above BirthDataForm
            ════════════════════════════════════════════════════════
            v6 had this floating absolutely at the top, which on mobile
            covered the "당신의 운명을 발견하세요" hero copy. Now it
            sits inline above BirthDataForm with the same max-width as
            the form so it aligns naturally:
              • Mobile: form stacks below hero copy → notice appears
                right above the name input, exactly where chandler
                wants it.
              • Desktop: BirthDataForm has a left hero column + right
                form column, but the form column is positioned
                top-aligned inside the same container. The notice
                sits above the entire form block — visually above the
                right-side name input on desktop without absolute.

            Visual upgrade for "더 쿨하게":
              • Subtle gold→transparent gradient background (was solid 8% gold)
              • Left gold accent bar replaces full border emphasis
              • Tighter padding (px-4 py-2.5) — more compact, less heavy
              • Smaller avatar (40px → 36px)
              • Single line on mobile when possible via clean copy
        ════════════════════════════════════════════════════════ */}
        <div className="max-w-3xl mx-auto px-4 pt-4 sm:pt-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/25 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3">
            {/* gold left accent bar */}
            <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500/60" />
            <div className="flex items-center gap-2.5 sm:gap-3 pl-2">
              {/* Soram avatar — 36px, smaller than v6 */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shrink-0 overflow-hidden shadow-md shadow-amber-500/25">
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-base">🌙</span>
                <img
                  src="/soram/soram_nav.webp"
                  alt=""
                  aria-hidden="true"
                  onError={(ev) => {
                    const el = ev.currentTarget;
                    el.style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              {/* Notice text — two compact lines */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-sm text-amber-100/95 leading-snug font-medium">
                  {locale === "ko" && "본인 사주는 최초 한 번만 입력 가능합니다."}
                  {locale === "ja" && "ご自身の四柱は初回一度だけ入力可能です。"}
                  {locale === "en" && "You can enter your own saju only once."}
                  {!["ko","ja","en"].includes(locale) && "You can enter your own saju only once."}
                </p>
                <p className="text-[10px] sm:text-[11px] text-amber-200/60 leading-snug mt-0.5">
                  {locale === "ko" && "잘못 입력 시 info@rimfactory.io"}
                  {locale === "ja" && "誤りがあれば info@rimfactory.io"}
                  {locale === "en" && "If incorrect: info@rimfactory.io"}
                  {!["ko","ja","en"].includes(locale) && "If incorrect: info@rimfactory.io"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <BirthDataForm onCalculate={handleCalculate} />
      </div>
    );
  }

  // ============= 컨펌 모달 =============
  if (phase === "confirm" && pending) {
    return <ConfirmModal pending={pending} locale={locale} onConfirm={handleConfirm} onCancel={handleCancel} />;
  }

  // ============= 저장 중 =============
  if (phase === "saving") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0A0E1A] to-[#1A1A2E]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/80">
            {locale === "ko" && "당신의 사주를 새기고 있어요..."}
            {locale === "ja" && "あなたの四柱を刻んでいます..."}
            {locale === "en" && "Engraving your chart..."}
          </p>
        </div>
      </div>
    );
  }

  // ============= 성공 화면 =============
  if (phase === "success") {
    return <SuccessScreen locale={locale} />;
  }

  // ============= 에러 화면 =============
  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0A0E1A] to-[#1A1A2E]">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">😿</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {locale === "ko" && "잠시 문제가 있었어요"}
            {locale === "ja" && "問題が発生しました"}
            {locale === "en" && "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleCancel}>
              {locale === "ko" ? "다시 입력" : locale === "ja" ? "再入力" : "Re-enter"}
            </Button>
            <Button onClick={handleConfirm} className="gold-gradient text-primary-foreground">
              {locale === "ko" ? "다시 시도" : locale === "ja" ? "再試行" : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// Confirm Modal Component
// ============================================================

function ConfirmModal({
  pending,
  locale,
  onConfirm,
  onCancel,
}: {
  pending: PendingData;
  locale: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { chart, cityName } = pending;
  const birthDate = chart.birthDate instanceof Date ? chart.birthDate : new Date(chart.birthDate);

  const dateStr = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;

  const timeStr = chart.birthHourUnknown
    ? locale === "ko"
      ? "시간 모름"
      : locale === "ja"
      ? "時間不明"
      : "Time unknown"
    : `${String(chart.birthHour ?? 0).padStart(2, "0")}:00`;

  const genderStr =
    chart.gender === "male"
      ? locale === "ko"
        ? "남성"
        : locale === "ja"
        ? "男性"
        : "Male"
      : locale === "ko"
      ? "여성"
      : locale === "ja"
      ? "女性"
      : "Female";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 22 }}
          className="bg-[#161823] border border-[rgba(242,202,80,0.25)] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 소람 작은 이미지 */}
          <div className="flex justify-center mb-4">
            <img
              src="/soram/v1/main/soram_serious.webp"
              alt=""
              className="w-24 h-24 object-cover rounded-full border-2 border-[rgba(242,202,80,0.3)]"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-serif text-center text-primary mb-2">
            {locale === "ko" && "한 번 더 확인해주세요"}
            {locale === "ja" && "もう一度ご確認ください"}
            {locale === "en" && "Please confirm"}
          </h2>

          <p className="text-xs text-center text-muted-foreground mb-6">
            {locale === "ko" && "수정이 필요하면 info@rimfactory.io로 문의해주세요"}
            {locale === "ja" && "修正が必要な場合は info@rimfactory.io へ"}
            {locale === "en" && "To make changes later, contact info@rimfactory.io"}
          </p>

          <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4 sm:p-5 space-y-3 mb-6">
            <Row label={locale === "ko" ? "이름" : locale === "ja" ? "名前" : "Name"} value={chart.name} />
            <Row
              label={locale === "ko" ? "생년월일" : locale === "ja" ? "生年月日" : "Birth Date"}
              value={dateStr}
            />
            <Row
              label={locale === "ko" ? "시간" : locale === "ja" ? "時刻" : "Time"}
              value={timeStr}
              dim={chart.birthHourUnknown}
            />
            <Row label={locale === "ko" ? "성별" : locale === "ja" ? "性別" : "Gender"} value={genderStr} />
            <Row
              label={locale === "ko" ? "출생 도시" : locale === "ja" ? "出生地" : "Birth City"}
              value={cityName}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-[rgba(255,255,255,0.15)] text-muted-foreground hover:bg-white/5 transition"
            >
              {locale === "ko" && "다시 입력"}
              {locale === "ja" && "再入力"}
              {locale === "en" && "Re-enter"}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A84B] to-[#F2CA50] text-[#0A0E1A] font-semibold hover:scale-[1.02] transition shadow-lg"
            >
              {locale === "ko" && "네, 맞아요"}
              {locale === "ja" && "はい、合っています"}
              {locale === "en" && "Yes, save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${dim ? "text-muted-foreground/70" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// Success Screen
// ============================================================

function SuccessScreen({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#0A0E1A] to-[#1A1A2E]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        <motion.img
          src="/soram/v1/main/soram_cheering.webp"
          alt="Soram"
          className="w-64 h-auto mx-auto mb-6 rounded-2xl shadow-2xl"
          initial={{ y: 20 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-serif text-primary mb-3"
        >
          {locale === "ko" && "당신을 평생 기억할게요 🌙"}
          {locale === "ja" && "あなたを一生覚えています 🌙"}
          {locale === "en" && "I'll remember you forever 🌙"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-muted-foreground mb-8"
        >
          {locale === "ko" && "이제 무엇이든 물어보세요"}
          {locale === "ja" && "何でも聞いてください"}
          {locale === "en" && "Ask me anything now"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>
            {locale === "ko" && "잠시 후 대시보드로 이동합니다..."}
            {locale === "ja" && "間もなくダッシュボードに移動します..."}
            {locale === "en" && "Redirecting to dashboard..."}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
