"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ─── Types ─── */

type Step = "loading" | "no-credits" | "form" | "clarifying" | "generating" | "report";

interface Report {
  title: string;
  content: string;
}

const CATEGORIES = [
  { id: "career", label: "Career & Work", icon: Briefcase, color: "#3B82F6" },
  { id: "love", label: "Love & Relationships", icon: Heart, color: "#EC4899" },
  { id: "timing", label: "Timing & Decisions", icon: Clock, color: "#F59E0B" },
  { id: "wealth", label: "Wealth & Finance", icon: TrendingUp, color: "#10B981" },
  { id: "health", label: "Health & Wellness", icon: Activity, color: "#8B5CF6" },
  { id: "general", label: "General Life", icon: HelpCircle, color: "#6B7280" },
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

/* ─── Component ─── */

export function ConsultationClient() {
  const { user, sajuData, isLoading: authLoading, openSignInModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>("loading");
  const [credits, setCredits] = useState(0);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [consultationId, setConsultationId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* ─── Payment callback ─── */
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId && user) {
      verifyPayment(sessionId);
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
    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-report", consultationId, userId: user!.id }),
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
    try {
      const res = await fetch("/api/payment/verify-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: user!.id }),
      });
      const data = await res.json();
      if (data.success) {
        // Clean URL and refresh credits
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
      checkCredits();
    } else if (!authLoading && !user) {
      setStep("no-credits");
    }
  }, [authLoading, user, checkCredits]);

  /* ─── Start consultation ─── */
  const handleStartConsultation = async () => {
    if (!question.trim() || !category || !user) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/consultation/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: user.id,
          category,
          question: question.trim(),
          birthData: sajuData.chart,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      setConsultationId(data.consultationId);

      if (data.needsClarification) {
        setClarifyingQuestions(data.questions);
        setClarifyingAnswers(new Array(data.questions.length).fill(""));
        setStep("clarifying");
      } else if (data.report) {
        setReport(data.report);
        setCredits((c) => Math.max(0, c - 1));
        setStep("report");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setIsSubmitting(false);
  };

  /* ─── Submit clarifications ─── */
  const handleSubmitAnswers = async () => {
    if (clarifyingAnswers.some((a) => !a.trim())) return;
    setIsSubmitting(true);
    setStep("generating");
    setError("");

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
        setError(data.error || "Generation failed");
        setStep("clarifying");
        setIsSubmitting(false);
        return;
      }

      setReport(data.report);
      setCredits((c) => Math.max(0, c - 1));
      setStep("report");
    } catch {
      setError("Network error. Please try again.");
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
        body: JSON.stringify({ userId: user.id }),
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
          Master Consultation
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
          Your Personal <span className="gold-gradient-text">Saju Advisor</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Ask any life question and receive a detailed analysis through the lens of your unique birth chart.
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
              hasChart={!!sajuData.chart}
              onPurchase={handlePurchase}
              onSignIn={openSignInModal}
              isSubmitting={isSubmitting}
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
                  consultation{credits !== 1 ? "s" : ""} remaining
                </span>
              </div>
            </div>

            {!sajuData.chart && (
              <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <p className="text-amber-200 text-sm mb-2">
                  For the most accurate consultation, generate your Saju reading first.
                </p>
                <Link href="/calculate">
                  <Button variant="outline" size="sm">
                    Generate My Chart
                  </Button>
                </Link>
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                What area of life is your question about?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
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
                Describe your question or situation
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Be as specific as possible — the more context you provide, the more precise your reading will be..."
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
                  Example questions:
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
              onClick={handleStartConsultation}
              disabled={!category || question.trim().length < 10 || isSubmitting}
              className="w-full h-12 gold-gradient text-primary-foreground font-semibold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing your question...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Consultation
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
                  <p className="font-medium text-foreground">A few more details</p>
                  <p className="text-xs text-muted-foreground">
                    To give you the most precise reading, I need a bit more context.
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
                      placeholder="Your answer..."
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
                Back
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
                Generate My Reading
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
            className="flex flex-col items-center justify-center min-h-[40vh] text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <h3 className="font-serif text-xl mb-2">Consulting the Four Pillars</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Analyzing your birth chart in relation to your question.
              This may take 30–60 seconds...
            </p>
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                />
              ))}
            </div>
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
                  Consultation Complete
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {report.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

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
                  New Consultation ({credits} left)
                </Button>
              )}
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Consultations
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── No Credits CTA ─── */

function NoCreditsCTA({
  isLoggedIn,
  hasChart,
  onPurchase,
  onSignIn,
  isSubmitting,
}: {
  isLoggedIn: boolean;
  hasChart: boolean;
  onPurchase: () => void;
  onSignIn: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="bg-card/50 border border-border rounded-2xl p-8 text-center">
      <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
      <h2 className="font-serif text-2xl font-semibold mb-2">
        Unlock Master Consultations
      </h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        Get 5 in-depth Saju consultations for any life question — career, love, timing, and more.
        Each session produces a personalized 2,000–4,000 word analysis based on your birth chart.
      </p>

      <div className="flex items-baseline justify-center gap-1 mb-1">
        <span className="text-4xl font-bold text-primary">$29.99</span>
        <span className="text-muted-foreground text-sm">one-time</span>
      </div>
      <p className="text-xs text-muted-foreground/60 mb-6">
        $6 per consultation · No subscription
      </p>

      <ul className="text-sm text-muted-foreground space-y-2 mb-8 max-w-sm mx-auto text-left">
        {[
          "5 personalized consultation sessions",
          "Ask about any area of life",
          "Detailed analysis through your birth chart",
          "All reports saved to your dashboard",
        ].map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {isLoggedIn ? (
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
          Get 5 Consultations
        </Button>
      ) : (
        <Button
          onClick={onSignIn}
          className="w-full max-w-sm h-12 gold-gradient text-primary-foreground font-semibold"
          size="lg"
        >
          Sign In to Get Started
        </Button>
      )}

      {!hasChart && isLoggedIn && (
        <p className="text-xs text-muted-foreground/50 mt-4">
          Tip: <Link href="/calculate" className="text-primary hover:underline">Generate your free Saju reading</Link> first for more accurate consultations.
        </p>
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
