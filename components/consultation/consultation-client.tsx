"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

type Step = "loading" | "no-credits" | "form" | "clarifying" | "generating" | "report";

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

const EXAMPLE_QUESTIONS: Record<string, string[]> = {
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
};

const emptyBirthData = (): BirthData => ({
  name: "",
  gender: "",
  year: CURRENT_YEAR - 25,
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
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [consultationId, setConsultationId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  /* ─── Auto-fill birth data from existing chart ─── */
  useEffect(() => {
    if (autoFilled) return;

    // Try from sajuData (auth context)
    if (sajuData.chart) {
      const bd = typeof sajuData.chart.birthDate === "string"
        ? new Date(sajuData.chart.birthDate)
        : sajuData.chart.birthDate;
      setBirthData({
        name: sajuData.chart.name,
        gender: sajuData.chart.gender,
        year: bd.getFullYear(),
        month: bd.getMonth() + 1,
        day: bd.getDate(),
        hour: 12,
        cityQuery: sajuData.chart.birthCity,
        selectedCity: { name: sajuData.chart.birthCity, country: "", lat: 0, lng: 0 } as City,
      });
      setBirthDataLocked(true);
      setAutoFilled(true);
      return;
    }

    // Try from localStorage
    try {
      const raw = safeGet("saju-data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.chart) {
          const bd = new Date(parsed.chart.birthDate);
          setBirthData({
            name: parsed.chart.name,
            gender: parsed.chart.gender,
            year: bd.getFullYear(),
            month: bd.getMonth() + 1,
            day: bd.getDate(),
            hour: 12,
            cityQuery: parsed.chart.birthCity,
            selectedCity: { name: parsed.chart.birthCity, country: "", lat: 0, lng: 0 } as City,
          });
          setBirthDataLocked(true);
          setAutoFilled(true);
        }
      }
    } catch {}
  }, [sajuData.chart, autoFilled]);

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

  /* ─── Payment callback ─── */
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId && user) {
      verifyPayment(sessionId);
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
        setError(data.error || "Something went wrong");
        setStep("form");
        setIsSubmitting(false);
        return;
      }

      setConsultationId(data.consultationId);

      if (data.needsClarification) {
        setClarifyingQuestions(data.questions);
        setClarifyingAnswers(new Array(data.questions.length).fill(""));
        setStep("clarifying");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (data.report) {
        setReport(data.report);
        setCredits((c) => Math.max(0, c - 1));
        setStep("report");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("Unexpected response. Please try again.");
        setStep("form");
      }
    } catch {
      setError("Network error. Please try again.");
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
          answers: clarifyingAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed. Your credit is safe — please try again.");
        setStep("clarifying");
        setIsSubmitting(false);
        return;
      }

      setReport(data.report);
      setCredits((c) => Math.max(0, c - 1));
      setStep("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again — your credit was not used.");
      setStep("clarifying");
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
      setError("Payment setup failed");
    }
    setIsSubmitting(false);
  };

  /* ─── Reset for new consultation ─── */
  const handleNewConsultation = () => {
    setCategory("");
    setQuestion("");
    setClarifyingQuestions([]);
    setClarifyingAnswers([]);
    setConsultationId("");
    setReport(null);
    setError("");
    setStep("form");
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
                {t("consult.questionLabel", locale)}
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
                  {EXAMPLE_QUESTIONS[category]?.map((ex, i) => (
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
              disabled={!category || question.trim().length < 10 || !isBirthDataValid || isSubmitting}
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

        {/* ─── Clarifying Questions ─── */}
        {step === "clarifying" && (
          <motion.div
            key="clarifying"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("consult.moreDetails", locale)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("consult.moreContext", locale)}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {clarifyingQuestions.map((q, i) => (
                  <div key={i}>
                    <label className="block text-sm text-foreground mb-2">
                      {q}
                    </label>
                    <textarea
                      value={clarifyingAnswers[i] || ""}
                      onChange={(e) => {
                        const newAnswers = [...clarifyingAnswers];
                        newAnswers[i] = e.target.value;
                        setClarifyingAnswers(newAnswers);
                      }}
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-xl bg-background/50 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none transition-colors"
                      placeholder={t("consult.yourAnswer", locale)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("form")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back", locale)}
              </Button>
              <Button
                onClick={handleSubmitAnswers}
                disabled={clarifyingAnswers.some((a) => !a.trim()) || isSubmitting}
                className="flex-[2] gold-gradient text-primary-foreground font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                {t("consult.generateReading", locale)}
              </Button>
            </div>
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
                    prose-headings:font-serif prose-headings:text-primary 
                    prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
                    prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-strong:text-foreground
                    prose-li:text-muted-foreground"
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
        <label className="block text-xs text-muted-foreground mb-2">{t("form.birthDate", locale)}</label>
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

const CONSULTATION_STEPS: Record<string, { icon: string; label: string; sub: string }[]> = {
  career: [
    { icon: "🏛", label: "Reading your Four Pillars", sub: "Mapping the cosmic blueprint of your career" },
    { icon: "⚖", label: "Analyzing element balance", sub: "Finding strengths and growth areas" },
    { icon: "💼", label: "Consulting the Career Palace", sub: "직업궁 (Jigeopgung) — your professional destiny" },
    { icon: "🔄", label: "Checking current cycles", sub: "How 2026 shapes your work path" },
    { icon: "✦", label: "Identifying favorable timing", sub: "Best months for bold moves" },
    { icon: "📜", label: "Weaving your consultation report", sub: "Crafting personalized guidance…" },
  ],
  love: [
    { icon: "🏛", label: "Reading your Four Pillars", sub: "Mapping the cosmic blueprint of your heart" },
    { icon: "💧", label: "Analyzing element harmony", sub: "Water, Fire, and the dance of connection" },
    { icon: "💕", label: "Consulting the Relationship Palace", sub: "배우자궁 (Baeujagang) — your love destiny" },
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
};

function ConsultationLoader({ category, locale }: { category: string; locale: "en" | "ko" | "ja" }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const steps = CONSULTATION_STEPS[category] || CONSULTATION_STEPS.default;

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

  // Headers (process ### before ## before #)
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');

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
