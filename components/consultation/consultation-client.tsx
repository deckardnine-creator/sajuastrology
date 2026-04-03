"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Heart,
  Clock,
  TrendingUp,
  Activity,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  Crown,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { searchCities, type City } from "@/lib/cities-data";
import { safeGet } from "@/lib/safe-storage";
import Link from "next/link";

/* ─── Types ─── */

type Step = "loading" | "no-credits" | "form" | "generating" | "report";

interface Report {
  title: string;
  content: string;
}

interface BirthData {
  name: string;
  gender: "male" | "female" | "";
  year: number;
  month: number;
  day: number;
  hour: number;
  cityQuery: string;
  selectedCity: City | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const HOUR_LABELS: Record<number, string> = {
  0: "12 AM (Midnight)", 1: "1 AM", 2: "2 AM", 3: "3 AM", 4: "4 AM", 5: "5 AM",
  6: "6 AM", 7: "7 AM", 8: "8 AM", 9: "9 AM", 10: "10 AM", 11: "11 AM",
  12: "12 PM (Noon)", 13: "1 PM", 14: "2 PM", 15: "3 PM", 16: "4 PM", 17: "5 PM",
  18: "6 PM", 19: "7 PM", 20: "8 PM", 21: "9 PM", 22: "10 PM", 23: "11 PM",
};

const getCategoryItems = (locale: "en" | "ko" | "ja") => [
  { id: "career", label: t("cat.career", locale), icon: Briefcase, color: "#3B82F6" },
  { id: "love", label: t("cat.love", locale), icon: Heart, color: "#EC4899" },
  { id: "timing", label: t("cat.timing", locale), icon: Clock, color: "#F59E0B" },
  { id: "wealth", label: t("cat.wealth", locale), icon: TrendingUp, color: "#10B981" },
  { id: "health", label: t("cat.health", locale), icon: Activity, color: "#8B5CF6" },
  { id: "general", label: t("cat.general", locale), icon: HelpCircle, color: "#6B7280" },
];

const EXAMPLE_QUESTIONS: Record<string, Record<string, string[]>> = {
  en: {
    career: [
      "Should I change jobs this year? I've been at my company for 3 years and feel stuck.",
      "I'm considering starting a business in tech. Is 2026 a favorable year for entrepreneurship?",
      "I got two job offers — one stable, one risky but exciting. Which aligns better with my chart?",
    ],
    love: [
      "I'm single and wondering if this year brings romantic opportunities. What should I look for?",
      "My partner and I are considering marriage in late 2026. Is the timing favorable?",
      "I keep attracting the wrong type. What does my chart say about my relationship patterns?",
    ],
    timing: [
      "When is the best time to make a major investment this year?",
      "I'm planning to relocate. Which months in 2026 are most favorable for a big move?",
      "Should I start my project now or wait until next quarter?",
    ],
    wealth: [
      "What does my chart say about my wealth potential over the next 5 years?",
      "I'm torn between saving aggressively or investing in real estate. What suits my chart?",
      "Are there specific months this year where financial opportunities are strongest?",
    ],
    health: [
      "I've been feeling low energy. What does my chart suggest about my health this year?",
      "Which elements should I focus on to improve my overall vitality?",
      "Are there any periods this year where I should be extra careful about health?",
    ],
    general: [
      "Give me an overview of what 2026 holds for me across all life areas.",
      "I feel like I'm at a crossroads. What does my current cycle suggest about my path?",
      "What are my greatest strengths and blind spots according to my chart?",
    ],
  },
  ko: {
    career: [
      "올해 이직을 해야 할까요? 3년째 같은 회사에 다니고 있는데 성장이 멈춘 느낌입니다.",
      "IT 분야 창업을 고민 중입니다. 2026년이 창업하기 좋은 해인지 사주로 봐주세요.",
      "두 개의 취업 제안이 있어요. 하나는 안정적이고 하나는 리스크가 있지만 흥미롭습니다. 제 사주와 어울리는 선택은 무엇인가요?",
    ],
    love: [
      "현재 솔로인데 올해 연애운이 어떤지, 어떤 점에 집중해야 하는지 알고 싶습니다.",
      "파트너와 2026년 하반기 결혼을 생각 중인데, 시기가 적합한지 봐주세요.",
      "계속 맞지 않는 사람을 만나게 됩니다. 제 사주에서 연애 패턴이 보이나요?",
    ],
    timing: [
      "올해 큰 투자를 하기에 가장 좋은 시기는 언제인가요?",
      "이사를 계획 중입니다. 2026년 중 큰 이동에 유리한 달은 언제인가요?",
      "지금 프로젝트를 시작해야 할까요, 아니면 다음 분기까지 기다려야 할까요?",
    ],
    wealth: [
      "향후 5년간 제 재물운은 어떻게 되나요?",
      "공격적 저축과 부동산 투자 사이에서 고민 중입니다. 제 사주에는 어떤 방향이 맞나요?",
      "올해 재물 기회가 가장 강한 달이 있나요?",
    ],
    health: [
      "최근 에너지가 많이 떨어졌습니다. 제 사주로 올해 건강운을 봐주세요.",
      "전반적인 건강을 위해 어떤 오행을 보완해야 하나요?",
      "올해 건강에 특히 주의해야 하는 시기가 있나요?",
    ],
    general: [
      "2026년 전체적인 운세 흐름을 전반적으로 봐주세요.",
      "지금 인생의 갈림길에 선 느낌입니다. 현재 대운이 제 방향에 대해 무엇을 말해주나요?",
      "제 사주에서 가장 큰 강점과 주의해야 할 점은 무엇인가요?",
    ],
  },
  ja: {
    career: [
      "今年転職すべきでしょうか？同じ会社に3年いて成長が止まった気がします。",
      "IT分野での起業を考えています。2026年は起業に適した年ですか？",
      "2つの内定があります。一つは安定、もう一つはリスクがあるが面白い。どちらが私の命式に合いますか？",
    ],
    love: [
      "現在独身ですが、今年恋愛の機会はありますか？どんな点に注目すべきでしょうか。",
      "パートナーと2026年後半の結婚を考えています。時期は適切ですか？",
      "なぜか合わない人ばかり引き寄せてしまいます。私の命式に恋愛パターンは見えますか？",
    ],
    timing: [
      "今年大きな投資をするのに最適な時期はいつですか？",
      "引越しを計画しています。2026年で大きな移動に有利な月はいつですか？",
      "今すぐプロジェクトを始めるべきか、来四半期まで待つべきか？",
    ],
    wealth: [
      "今後5年間の財運はどうなりますか？",
      "積極的な貯蓄と不動産投資の間で迷っています。私の命式にはどちらが合いますか？",
      "今年財運が特に強い月はありますか？",
    ],
    health: [
      "最近エネルギーが落ちています。今年の健康運を四柱で見てください。",
      "全体的な健康のために、どの五行を補うべきですか？",
      "今年特に健康に注意が必要な時期はありますか？",
    ],
    general: [
      "2026年の全体的な運気の流れを教えてください。",
      "人生の岐路に立っている気がします。現在の大運は私の方向性について何を示していますか？",
      "私の命式で最大の強みと注意すべき点は何ですか？",
    ],
  },
};

const emptyBirthData = (): BirthData => ({
  name: "",
  gender: "",
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  cityQuery: "",
  selectedCity: null,
});

/* ─── Component ─── */

export function ConsultationClient() {
  const { user, sajuData, isLoading: authLoading, openSignInModal } = useAuth();
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>("loading");
  const [credits, setCredits] = useState(0);
  const [birthData, setBirthData] = useState<BirthData>(emptyBirthData());
  const [birthDataLocked, setBirthDataLocked] = useState(false);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [consultationId, setConsultationId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [partialReport, setPartialReport] = useState<Report | null>(null);

  /* ─── Auto-fill disabled: always start fresh ─── */
  // Users should manually enter birth data each consultation session

  /* ─── Warn before leaving during generation ─── */
  useEffect(() => {
    if (step !== "generating") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your reading is being generated. Please don't leave this page.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  /* ─── Progressive polling — show partial report while generating ─── */
  useEffect(() => {
    if (step !== "generating" || !user) return;
    // Start polling after 5 seconds (give AI time to start)
    const startDelay = setTimeout(() => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/consultation/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "poll", userId: user.id }),
          });
          if (!res.ok) return;
          const data = await res.json();
          if (data.report && data.report.content && data.report.content.length > 50) {
            setPartialReport(data.report);
          }
        } catch {}
      }, 3000);
    }, 5000);

    return () => {
      clearTimeout(startDelay);
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [step, user]);

  /* ─── Safety timeout — prevent infinite generating state ─── */
  useEffect(() => {
    if (step !== "generating") return;
    const safety = setTimeout(() => {
      if (step === "generating" && !report) {
        // If partial report exists, show it as final
        if (partialReport) {
          setReport(partialReport);
          setPartialReport(null);
          setCredits((c) => Math.max(0, c - 1));
          setStep("report");
        } else {
          setError(locale === "ko" ? "생성 시간이 초과되었습니다. 다시 시도해주세요." : locale === "ja" ? "生成がタイムアウトしました。再試行してください。" : "Generation timed out. Please try again.");
          setStep("form");
        }
        setIsSubmitting(false);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    }, 90000);
    return () => clearTimeout(safety);
  }, [step]);

  /* ─── Payment callback ─── */
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id") || searchParams.get("token");
    if (payment === "success" && sessionId && user) {
      verifyPayment(sessionId);
    } else if (payment === "success" && user) {
      // Admin bypass — credits already added, just check
      router.replace("/consultation");
      checkCredits();
    } else if (payment === "cancelled") {
      router.replace("/consultation");
    }
  }, [searchParams, user]);

  /* ─── View saved report ─── */
  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && user) {
      loadSavedReport(viewId);
    }
  }, [searchParams, user]);

  const loadSavedReport = async (consultationId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-report", consultationId, userId: user.id }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setStep("report");
      }
    } catch (err) {
      console.error("Load report error:", err);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/payment/verify-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/consultation");
        checkCredits();
      }
    } catch (err) {
      console.error("Payment verify error:", err);
    }
  };

  /* ─── Check credits ─── */
  const checkCredits = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-credits", userId: user.id }),
      });
      const data = await res.json();
      setCredits(data.remaining || 0);
      setStep(data.remaining > 0 ? "form" : "no-credits");
    } catch {
      setStep("no-credits");
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      const viewId = searchParams.get("view");
      if (!viewId) {
        checkCredits();
      }
    } else if (!authLoading && !user) {
      setStep("no-credits");
    }
  }, [authLoading, user, checkCredits, searchParams]);

  /* ─── Birth data validation ─── */
  const isBirthDataValid = birthData.name.trim().length >= 1 &&
    birthData.gender !== "" &&
    birthData.selectedCity !== null;

  /* ─── Start consultation ─── */
  const handleStartConsultation = async () => {
    if (!question.trim() || !category || !user || !isBirthDataValid) return;
    setIsSubmitting(true);
    setError("");
    setStep("generating");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: user.id,
          category,
          question: question.trim(),
          locale,
          birthInput: {
            name: birthData.name.trim(),
            gender: birthData.gender,
            year: birthData.year,
            month: birthData.month,
            day: birthData.day,
            hour: birthData.hour,
            city: birthData.selectedCity!.name,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        {
          const rawErr = data.error || "Something went wrong";
          setError((rawErr?.includes("529") || rawErr?.includes("overloaded"))
            ? (locale === "ko" ? "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요." : locale === "ja" ? "AIが混雑しています。しばらくしてから再試行してください。" : "The AI is busy right now. Please try again in a moment.")
            : (locale === "ko" ? "오류가 발생했습니다. 다시 시도해주세요." : locale === "ja" ? "エラーが発生しました。再試行してください。" : "Something went wrong. Please try again."));
        }
        setStep("form");
        setIsSubmitting(false);
        return;
      }

      setConsultationId(data.consultationId);

      if (data.report) {
        setReport(data.report);
        setPartialReport(null);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setCredits((c) => Math.max(0, c - 1));
        setStep("report");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (data.needsClarification && data.questions) {
        // Auto-submit clarifying questions with empty answers to skip the step
        // Just go straight to report generation
        try {
          const clarifyRes = await fetch("/api/consultation/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "submit-answers",
              consultationId: data.consultationId,
              answers: data.questions.map(() => "Please provide your best analysis based on the question given."),
            }),
          });
          const clarifyData = await clarifyRes.json();
          if (clarifyData.report) {
            setReport(clarifyData.report);
            setCredits((c) => Math.max(0, c - 1));
            setStep("report");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            {
              const rawErr = clarifyData.error || "Generation failed.";
              setError((rawErr?.includes("529") || rawErr?.includes("overloaded"))
                ? (locale === "ko" ? "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요." : locale === "ja" ? "AIが混雑しています。しばらくしてから再試行してください。" : "The AI is busy right now. Please try again in a moment.")
                : (locale === "ko" ? "생성 실패. 크레딧은 사용되지 않았습니다." : locale === "ja" ? "生成に失敗しました。クレジットは使用されていません。" : "Generation failed. Your credit is safe."));
            }
            setStep("form");
          }
        } catch {
          setError(locale === "ko" ? "네트워크 오류. 다시 시도해주세요." : locale === "ja" ? "ネットワークエラー。再試行してください。" : "Network error. Please try again.");
          setStep("form");
        }
      } else {
        setError(locale === "ko" ? "예상치 못한 응답입니다. 다시 시도해주세요." : locale === "ja" ? "予期しない応答です。再試行してください。" : "Unexpected response. Please try again.");
        setStep("form");
      }
    } catch {
      setError(locale === "ko" ? "네트워크 오류. 다시 시도해주세요." : locale === "ja" ? "ネットワークエラー。再試行してください。" : "Network error. Please try again.");
      setStep("form");
    }
    setIsSubmitting(false);
  };

  /* ─── Submit clarifications ─── */
  const handleSubmitAnswers = async () => {
    if (clarifyingAnswers.some((a) => !a.trim())) return;
    setIsSubmitting(true);
    setStep("generating");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit-answers",
          consultationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        {
          const rawErr = data.error || "Generation failed.";
          setError((rawErr?.includes("529") || rawErr?.includes("overloaded"))
            ? (locale === "ko" ? "AI가 잠시 바빠요. 잠깐 후 다시 시도해주세요. 크레딧은 사용되지 않았습니다." : locale === "ja" ? "AIが混雑しています。クレジットは使用されていません。" : "The AI is busy right now. Please try again. Your credit was not used.")
            : (locale === "ko" ? "생성 실패. 크레딧은 안전합니다. 다시 시도해주세요." : locale === "ja" ? "生成に失敗しました。クレジットは安全です。" : "Generation failed. Your credit is safe — please try again."));
        }
        setStep("form");
        setIsSubmitting(false);
        return;
      }

      setReport(data.report);
      setCredits((c) => Math.max(0, c - 1));
      setStep("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(locale === "ko" ? "네트워크 오류. 크레딧은 사용되지 않았습니다. 다시 시도해주세요." : locale === "ja" ? "ネットワークエラー。クレジットは使用されていません。再試行してください。" : "Network error. Please try again — your credit was not used.");
      setStep("form");
    }
    setIsSubmitting(false);
  };

  /* ─── Purchase handler ─── */
  const handlePurchase = async () => {
    if (!user) {
      openSignInModal();
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment/checkout-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError(locale === "ko" ? "결제 설정 실패" : locale === "ja" ? "決済設定に失敗しました" : "Payment setup failed");
    }
    setIsSubmitting(false);
  };

  /* ─── Reset for new consultation ─── */
  const handleNewConsultation = () => {
    setCategory("");
    setQuestion("");
    setConsultationId("");
    setReport(null);
    setPartialReport(null);
    setError("");
    setStep("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
    checkCredits();
  };

  /* ─── Render ─── */

  if (step === "loading" || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
          <Crown className="w-4 h-4" />
          {t("consult.badge", locale)}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
          {t("consult.title1", locale)} <span className="gold-gradient-text">{t("consult.title2", locale)}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("consult.desc", locale)}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ─── No Credits ─── */}
        {step === "no-credits" && (
          <motion.div
            key="no-credits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NoCreditsCTA
              isLoggedIn={!!user}
              onPurchase={handlePurchase}
              onSignIn={openSignInModal}
              isSubmitting={isSubmitting}
              locale={locale}
            />
          </motion.div>
        )}

        {/* ─── Form ─── */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Credits Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="text-primary font-semibold">{credits}</span>{" "}
                  {credits !== 1 ? t("consult.consultations", locale) : t("consult.consultation", locale)} {t("consult.remaining", locale)}
                </span>
              </div>
            </div>

            {/* Birth Data Section */}
            <div className="bg-card/50 border border-border rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">{t("consult.birthInfo", locale)}</h3>
                {birthDataLocked && (
                  <button
                    onClick={() => setBirthDataLocked(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    {t("consult.edit", locale)}
                  </button>
                )}
              </div>

              {birthDataLocked && isBirthDataValid ? (
                /* Locked summary view */
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{birthData.name}</span>
                  <span>·</span>
                  <span>{birthData.gender === "male" ? "♂" : "♀"}</span>
                  <span>·</span>
                  <span>{birthData.year}.{String(birthData.month).padStart(2, "0")}.{String(birthData.day).padStart(2, "0")}</span>
                  <span>·</span>
                  <span>{HOUR_LABELS[birthData.hour]}</span>
                  <span>·</span>
                  <span>{birthData.selectedCity?.name}</span>
                </div>
              ) : (
                /* Editable form */
                <BirthDataForm data={birthData} onChange={(d) => setBirthData(d)} locale={locale} />
              )}
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                {t("consult.category", locale)}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getCategoryItems(locale).map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border bg-card/50 hover:border-muted-foreground/30"
                      }`}
                    >
                      <Icon
                        className="w-5 h-5 shrink-0"
                        style={{ color: isSelected ? cat.color : "hsl(var(--muted-foreground))" }}
                      />
                      <span className={`text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                {t("consult.questionLabelDetail", locale)}
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("consult.questionPlaceholder", locale)}
                rows={5}
                maxLength={2000}
                className="w-full rounded-xl bg-card/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none transition-colors"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-muted-foreground/50">
                  {question.length}/2,000
                </p>
                {question.length > 0 && question.length < 100 && question.length >= 30 && (
                  <p className="text-xs text-amber-400/70">
                    {locale === "ko" ? "100자 이상 자세히 입력할수록 정확한 답을 얻습니다" : locale === "ja" ? "100文字以上詳しく書くほど精度が上がります" : "Write 100+ chars for a more accurate reading"}
                  </p>
                )}
              </div>
            </div>

            {/* Example Questions */}
            {category && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6"
              >
                <p className="text-xs text-muted-foreground/60 mb-2">
                  {t("consult.exampleQuestions", locale)}
                </p>
                <div className="space-y-2">
                  {EXAMPLE_QUESTIONS[locale]?.[category]?.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(ex)}
                      className="block w-full text-left text-xs text-muted-foreground hover:text-foreground p-2.5 rounded-lg bg-card/30 border border-border/50 hover:border-border transition-colors"
                    >
                      &ldquo;{ex}&rdquo;
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <Button
              onClick={() => {
                if (!birthDataLocked && isBirthDataValid) {
                  setBirthDataLocked(true);
                }
                handleStartConsultation();
              }}
              disabled={!category || question.trim().length < 30 || !isBirthDataValid || isSubmitting}
              className="w-full h-12 gold-gradient text-primary-foreground font-semibold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("consult.analyzing", locale)}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("consult.submit", locale)}
                </>
              )}
            </Button>
          </motion.div>
        )}



        {/* ─── Generating ─── */}
        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ConsultationLoader category={category} locale={locale} />

            {/* Progressive preview — show partial report as it generates */}
            {partialReport && partialReport.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="bg-card/50 border border-primary/20 rounded-2xl overflow-hidden">
                  <div className="px-6 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-xs text-primary font-medium">
                      {locale === "ko" ? "미리보기 — 생성 중..." : locale === "ja" ? "プレビュー — 生成中..." : "Preview — generating..."}
                    </span>
                  </div>
                  {partialReport.title && (
                    <div className="px-6 pt-4">
                      <h2 className="font-serif text-lg font-semibold text-foreground">{partialReport.title}</h2>
                    </div>
                  )}
                  <div className="px-6 py-4">
                    <div
                      className="prose prose-invert prose-sm max-w-none
                        prose-headings:font-serif prose-headings:text-primary prose-headings:font-semibold
                        prose-h1:text-xl prose-h1:mt-0 prose-h1:mb-4
                        prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-primary/20
                        prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-primary/80
                        prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:mb-4
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-li:text-foreground/85 prose-li:leading-relaxed prose-li:mb-1
                        prose-ul:my-3 prose-ol:my-3"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(partialReport.content) }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Report ─── */}
        {step === "report" && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Report Card */}
            <div className="bg-card/50 border border-border rounded-2xl overflow-hidden mb-6">
              {/* Report Header */}
              <div className="px-6 py-5 border-b border-border bg-primary/5">
                <div className="flex items-center gap-2 text-xs text-primary mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("consult.complete", locale)}
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {report.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Chart Info Bar */}
              {birthData.name && (
                <div className="px-6 py-3 border-b border-border bg-card/30 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{birthData.name}</span>
                    <span>·</span>
                    <span>{birthData.year}.{String(birthData.month).padStart(2, "0")}.{String(birthData.day).padStart(2, "0")}</span>
                    {birthData.selectedCity && (
                      <>
                        <span>·</span>
                        <span>{birthData.selectedCity.name}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Report Content */}
              <div className="px-6 py-6">
                <div
                  className="prose prose-invert prose-sm max-w-none
                    prose-headings:font-serif prose-headings:text-primary prose-headings:font-semibold
                    prose-h1:text-xl prose-h1:mt-0 prose-h1:mb-4
                    prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-primary/20
                    prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-primary/80
                    prose-p:text-foreground/85 prose-p:leading-[1.85] prose-p:mb-4
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-li:text-foreground/85 prose-li:leading-relaxed prose-li:mb-1
                    prose-ul:my-3 prose-ol:my-3
                    prose-hr:border-border/30 prose-hr:my-6"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(report.content) }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {credits > 0 && (
                <Button
                  onClick={handleNewConsultation}
                  className="flex-1 gold-gradient text-primary-foreground font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("consult.newConsult", locale)} ({credits})
                </Button>
              )}
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  {t("consult.viewAll", locale)}
                </Button>
              </Link>
            </div>

            <p className="text-center text-[11px] text-muted-foreground/40 mt-6">
              {t("consult.entertainment", locale)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Birth Data Form ─── */

function BirthDataForm({ data, onChange, locale }: { data: BirthData; onChange: (d: BirthData) => void; locale: "en" | "ko" | "ja" }) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const cityResults = useMemo(() => {
    if (!data.cityQuery || data.cityQuery.length < 1) return [];
    return searchCities(data.cityQuery).slice(0, 8);
  }, [data.cityQuery]);

  useEffect(() => {
    setShowCityDropdown(cityResults.length > 0 && !data.selectedCity);
  }, [cityResults, data.selectedCity]);

  const daysInMonth = new Date(data.year, data.month, 0).getDate();

  return (
    <div className="space-y-4">
      {/* Name + Gender row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">{t("form.name", locale)}</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder={t("form.namePlaceholder", locale)}
            maxLength={50}
            className="w-full h-11 rounded-xl bg-background/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">{t("form.gender", locale)}</label>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => onChange({ ...data, gender: g })}
                className={`h-11 rounded-xl border text-sm font-medium transition-all ${
                  data.gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                {g === "male" ? t("form.male", locale) : t("form.female", locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Birth Date — steppers */}
      <div>
        <label className="block text-xs text-muted-foreground mb-2">{t("form.birthDate", locale)} <span className="text-[10px] opacity-60">({locale === "ko" ? "양력" : locale === "ja" ? "新暦" : "Solar Calendar"})</span></label>
        <div className="grid grid-cols-3 gap-2">
          {/* Year */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/60 uppercase">{t("form.year", locale)}</span>
            <div className="flex items-center w-full bg-background/50 border border-border rounded-xl overflow-hidden">
              <button type="button" onClick={() => onChange({ ...data, year: Math.max(1920, data.year - 1) })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">−</button>
              <span className="flex-1 text-center text-xs font-semibold text-primary">{data.year}</span>
              <button type="button" onClick={() => onChange({ ...data, year: Math.min(CURRENT_YEAR, data.year + 1) })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">+</button>
            </div>
          </div>
          {/* Month */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/60 uppercase">{t("form.month", locale)}</span>
            <div className="flex items-center w-full bg-background/50 border border-border rounded-xl overflow-hidden">
              <button type="button" onClick={() => onChange({ ...data, month: data.month <= 1 ? 12 : data.month - 1 })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">−</button>
              <span className="flex-1 text-center text-sm font-semibold text-primary">{String(data.month).padStart(2,"0")}</span>
              <button type="button" onClick={() => onChange({ ...data, month: data.month >= 12 ? 1 : data.month + 1 })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">+</button>
            </div>
          </div>
          {/* Day */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/60 uppercase">{t("form.day", locale)}</span>
            <div className="flex items-center w-full bg-background/50 border border-border rounded-xl overflow-hidden">
              <button type="button" onClick={() => onChange({ ...data, day: data.day <= 1 ? daysInMonth : data.day - 1 })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">−</button>
              <span className="flex-1 text-center text-sm font-semibold text-primary">{String(data.day).padStart(2,"0")}</span>
              <button type="button" onClick={() => onChange({ ...data, day: data.day >= daysInMonth ? 1 : data.day + 1 })}
                className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors text-base">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Birth Hour — stepper */}
      <div>
        <label className="block text-xs text-muted-foreground mb-2">
          {t("form.birthHour", locale)} <span className="text-muted-foreground/50 text-[10px]">{t("form.birthHourNote", locale)}</span>
        </label>
        <div className="flex items-center justify-between bg-background/50 border border-border rounded-xl px-2 py-2">
          <button type="button" onClick={() => onChange({ ...data, hour: data.hour <= 0 ? 23 : data.hour - 1 })}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors text-lg">−</button>
          <span className="text-xs font-medium text-primary">{HOUR_LABELS[data.hour]}</span>
          <button type="button" onClick={() => onChange({ ...data, hour: data.hour >= 23 ? 0 : data.hour + 1 })}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors text-lg">+</button>
        </div>
      </div>

      {/* Birth City */}
      <div className="relative">
        <label className="block text-xs text-muted-foreground mb-1.5">{t("form.birthCity", locale)}</label>
        <input
          type="text"
          value={data.cityQuery}
          onChange={(e) => {
              const v = e.target.value;
              onChange({ ...data, cityQuery: v, selectedCity: data.selectedCity && v !== data.selectedCity.name ? null : data.selectedCity });
            }}
            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
          placeholder={t("form.cityPlaceholder", locale)}
          className="w-full h-11 rounded-xl bg-background/50 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
        {data.selectedCity && (
          <p className="text-xs text-primary mt-1">✓ {data.selectedCity.name}</p>
        )}
        {showCityDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {cityResults.map((city) => (
              <button
                key={`${city.name}-${city.lat}`}
                onClick={() => {
                  onChange({ ...data, cityQuery: city.name, selectedCity: city });
                  setShowCityDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors"
              >
                <span className="text-foreground">{city.name}</span>
                <span className="text-muted-foreground/60 ml-2">{city.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Consultation Loader ─── */

function getConsultationSteps(locale: string): Record<string, { icon: string; label: string; sub: string }[]> {
  const steps: Record<string, Record<string, { icon: string; label: string; sub: string }[]>> = {
    en: {
      career: [
        { icon: "🏛", label: "Reading your Four Pillars", sub: "Mapping the cosmic blueprint of your career" },
        { icon: "⚖", label: "Analyzing element balance", sub: "Finding strengths and growth areas" },
        { icon: "💼", label: "Consulting the Career Palace", sub: "Your professional destiny" },
        { icon: "🔄", label: "Checking current cycles", sub: "How 2026 shapes your work path" },
        { icon: "✦", label: "Identifying favorable timing", sub: "Best months for bold moves" },
        { icon: "📜", label: "Weaving your consultation report", sub: "Crafting personalized guidance…" },
      ],
      love: [
        { icon: "🏛", label: "Reading your Four Pillars", sub: "Mapping the cosmic blueprint of your heart" },
        { icon: "💧", label: "Analyzing element harmony", sub: "Water, Fire, and the dance of connection" },
        { icon: "💕", label: "Consulting the Relationship Palace", sub: "Your love destiny" },
        { icon: "🔄", label: "Checking current cycles", sub: "Romantic energy in your current phase" },
        { icon: "✦", label: "Finding auspicious timing", sub: "When the stars favor the heart" },
        { icon: "📜", label: "Weaving your consultation report", sub: "Crafting personalized guidance…" },
      ],
      default: [
        { icon: "🏛", label: "Reading your Four Pillars", sub: "Year · Month · Day · Hour" },
        { icon: "🌊", label: "Mapping the Five Elements", sub: "Wood · Fire · Earth · Metal · Water" },
        { icon: "✦", label: "Analyzing your Day Master", sub: "The core of who you are" },
        { icon: "🔄", label: "Consulting current cycles", sub: "What this period holds for you" },
        { icon: "⚖", label: "Weighing cosmic influences", sub: "Balancing opportunities and caution" },
        { icon: "📜", label: "Weaving your consultation report", sub: "Crafting personalized guidance…" },
      ],
    },
    ko: {
      career: [
        { icon: "🏛", label: "사주팔자 분석 중", sub: "직업 운명의 우주적 청사진을 읽는 중" },
        { icon: "⚖", label: "오행 균형 분석 중", sub: "강점과 성장 영역 파악 중" },
        { icon: "💼", label: "직업궁 상담 중", sub: "당신의 직업적 운명을 탐색하는 중" },
        { icon: "🔄", label: "현재 운세 사이클 확인 중", sub: "2026년이 당신의 직업에 미치는 영향" },
        { icon: "✦", label: "유리한 시기 파악 중", sub: "대담한 결정을 위한 최적의 달" },
        { icon: "📜", label: "상담 보고서 작성 중", sub: "맞춤 지침을 만드는 중…" },
      ],
      love: [
        { icon: "🏛", label: "사주팔자 분석 중", sub: "연애 운명의 우주적 청사진을 읽는 중" },
        { icon: "💧", label: "오행 조화 분석 중", sub: "수(水)와 화(火), 인연의 흐름" },
        { icon: "💕", label: "배우자궁 상담 중", sub: "당신의 연애 운명을 탐색하는 중" },
        { icon: "🔄", label: "현재 운세 사이클 확인 중", sub: "현재 시기의 연애 에너지" },
        { icon: "✦", label: "길한 시기 파악 중", sub: "인연이 빛나는 때를 찾는 중" },
        { icon: "📜", label: "상담 보고서 작성 중", sub: "맞춤 지침을 만드는 중…" },
      ],
      default: [
        { icon: "🏛", label: "사주팔자 분석 중", sub: "년 · 월 · 일 · 시" },
        { icon: "🌊", label: "오행 매핑 중", sub: "목 · 화 · 토 · 금 · 수" },
        { icon: "✦", label: "일주 분석 중", sub: "당신의 본질을 읽는 중" },
        { icon: "🔄", label: "현재 운세 사이클 상담 중", sub: "이 시기가 당신에게 말하는 것" },
        { icon: "⚖", label: "우주적 영향 분석 중", sub: "기회와 주의 사항의 균형" },
        { icon: "📜", label: "상담 보고서 작성 중", sub: "맞춤 지침을 만드는 중…" },
      ],
    },
    ja: {
      career: [
        { icon: "🏛", label: "四柱を読み解き中", sub: "仕事の宇宙的設計図をマッピング中" },
        { icon: "⚖", label: "五行バランスを分析中", sub: "強みと成長エリアを特定中" },
        { icon: "💼", label: "職業宮を鑑定中", sub: "あなたの職業的運命を探索中" },
        { icon: "🔄", label: "現在の運勢サイクルを確認中", sub: "2026年があなたの仕事に与える影響" },
        { icon: "✦", label: "有利なタイミングを特定中", sub: "大胆な行動に最適な月" },
        { icon: "📜", label: "相談レポートを作成中", sub: "パーソナライズされたガイダンスを作成中…" },
      ],
      love: [
        { icon: "🏛", label: "四柱を読み解き中", sub: "恋愛の宇宙的設計図をマッピング中" },
        { icon: "💧", label: "五行の調和を分析中", sub: "水と火、縁のダンス" },
        { icon: "💕", label: "配偶者宮を鑑定中", sub: "あなたの恋愛運命を探索中" },
        { icon: "🔄", label: "現在の運勢サイクルを確認中", sub: "現在の時期の恋愛エネルギー" },
        { icon: "✦", label: "吉日を探索中", sub: "縁が輝くタイミング" },
        { icon: "📜", label: "相談レポートを作成中", sub: "パーソナライズされたガイダンスを作成中…" },
      ],
      default: [
        { icon: "🏛", label: "四柱を読み解き中", sub: "年 · 月 · 日 · 時" },
        { icon: "🌊", label: "五行をマッピング中", sub: "木 · 火 · 土 · 金 · 水" },
        { icon: "✦", label: "日主を分析中", sub: "あなたの本質を読んでいます" },
        { icon: "🔄", label: "現在の運勢サイクルを鑑定中", sub: "この時期があなたに語ること" },
        { icon: "⚖", label: "宇宙的影響を分析中", sub: "機会と注意事項のバランス" },
        { icon: "📜", label: "相談レポートを作成中", sub: "パーソナライズされたガイダンスを作成中…" },
      ],
    },
  };
  return steps[locale] || steps.en;
}

function ConsultationLoader({ category, locale }: { category: string; locale: "en" | "ko" | "ja" }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const localizedSteps = getConsultationSteps(locale);
  const steps = localizedSteps[category] || localizedSteps.default;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 6000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const increment = prev < 30 ? 1.8 : prev < 60 ? 0.9 : 0.3;
        return Math.min(prev + increment, 92);
      });
    }, 400);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, [steps.length]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />

        {/* Rotating mandala */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border border-purple-500/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-amber-500/20"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-purple-400/30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <Crown className="w-8 h-8 text-purple-400" />
              </motion.div>
            </div>
          </div>
        </div>

        <h3 className="font-serif text-xl text-center mb-1">{t("consult.consultingPillars", locale)}</h3>
        <p className="text-xs text-center text-muted-foreground/60 mb-2">
          {formatTime(elapsedSeconds)} {t("consult.elapsed", locale)}
        </p>

        {/* Do not leave warning */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mb-6">
          <p className="text-[11px] text-amber-400/80 text-center">
            ⚠️ {t("consult.doNotLeave", locale)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #a78bfa66, #a78bfa)",
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((s, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isFuture = i > activeStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isFuture ? 0.15 : isDone ? 0.45 : 1,
                  x: isActive ? 4 : 0,
                }}
                transition={{ duration: 0.5, delay: isFuture ? 0 : i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg w-7 text-center flex-shrink-0">
                  {isDone ? "✓" : s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isActive ? "text-purple-300" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground/70 mt-0.5"
                    >
                      {s.sub}
                    </motion.p>
                  )}
                </div>
                {isActive && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-8">
          {t("consult.craftedUniquely", locale)}
        </p>
      </div>
    </div>
  );
}

/* ─── No Credits CTA ─── */

function NoCreditsCTA({
  isLoggedIn,
  onPurchase,
  onSignIn,
  isSubmitting,
  locale,
}: {
  isLoggedIn: boolean;
  onPurchase: () => void;
  onSignIn: () => void;
  isSubmitting: boolean;
  locale: "en" | "ko" | "ja";
}) {
  return (
    <div className="bg-card/50 border border-border rounded-2xl p-8 text-center">
      {!isLoggedIn ? (
        <>
          <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold mb-2">
            {t("consult.personalTitle", locale)}
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            {t("consult.personalDesc", locale)}
          </p>
          <Button
            onClick={onSignIn}
            className="w-full max-w-sm h-12 gold-gradient text-primary-foreground font-semibold"
            size="lg"
          >
            {t("consult.signIn", locale)}
          </Button>
          <p className="text-xs text-muted-foreground/50 mt-4">
            {t("consult.priceTag", locale)}
          </p>
        </>
      ) : (
        <>
          {/* Logged in, needs credits */}
          <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold mb-2">
            {t("consult.unlock", locale)}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {t("consult.unlockDesc", locale)}
          </p>

          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-bold text-primary">$29.99</span>
            <span className="text-muted-foreground text-sm">{t("pricing.oneTime", locale)}</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mb-6">
            {t("consult.perSession", locale)}
          </p>

          <ul className="text-sm text-muted-foreground space-y-2 mb-8 max-w-sm mx-auto text-left">
            {([
              t("consult.feat1", locale),
              t("consult.feat2", locale),
              t("consult.feat3", locale),
              t("consult.feat4", locale),
            ] as string[]).map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            onClick={onPurchase}
            disabled={isSubmitting}
            className="w-full max-w-sm h-12 font-semibold"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              color: "white",
            }}
            size="lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Crown className="w-4 h-4 mr-2" />
            )}
            {t("consult.get5", locale)}
          </Button>
        </>
      )}
    </div>
  );
}

/* ─── Simple Markdown → HTML renderer ─── */

function renderMarkdown(md: string): string {
  // Strip the first # heading (already shown in report header)
  let text = md.replace(/^#\s+.+\n*/m, "").trim();

  // Horizontal rules
  text = text.replace(/^---+$/gm, '<hr class="my-6 border-border/50" />');

  // Headers (process deepest first: #### → ### → ## → #)
  text = text.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');

  // Bold & italic (order matters)
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Bullet lists — wrap consecutive <li> items in <ul>
  text = text.replace(/^[-•] (.+)$/gm, '{{LI}}$1{{/LI}}');
  text = text.replace(/({{LI}}[\s\S]*?{{\/LI}}\n?)+/g, (match) => {
    const items = match.replace(/{{LI}}([\s\S]*?){{\/LI}}/g, '<li>$1</li>');
    return `<ul>${items}</ul>`;
  });

  // Numbered lists
  text = text.replace(/^\d+\.\s+(.+)$/gm, '{{OLI}}$1{{/OLI}}');
  text = text.replace(/({{OLI}}[\s\S]*?{{\/OLI}}\n?)+/g, (match) => {
    const items = match.replace(/{{OLI}}([\s\S]*?){{\/OLI}}/g, '<li>$1</li>');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs — split by double newlines, wrap non-tag lines
  text = text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap blocks that already start with HTML tags
      if (/^<(h[1-6]|ul|ol|li|hr|p|div|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  // Clean up any stray empty paragraphs
  text = text.replace(/<p>\s*<\/p>/g, "");

  return text;
}
