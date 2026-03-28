"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, Bookmark, Share2, Check, Heart } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { ELEMENTS, type Element } from "@/lib/saju-calculator";
import { DAY_MASTER_DISPLAY } from "@/lib/constants";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useAuth } from "@/lib/auth-context";
import { safeGet, safeSet, safeRemove } from "@/lib/safe-storage";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

// Render markdown to styled HTML
function renderPaidMarkdown(text: string | null): string {
  if (!text) return "";
  let result = text;
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-base font-semibold text-primary/80 mt-5 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-lg font-semibold text-primary border-b border-primary/20 pb-1 mt-7 mb-3">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-xl font-bold text-primary mt-0 mb-4">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em class="text-foreground/80">$1</em>');
  result = result.replace(/^[-•] (.+)$/gm, '<li class="text-foreground/85 leading-relaxed mb-1 ml-4">$1</li>');
  result = result.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, function(m) { return '<ul class="my-3 list-disc space-y-1">' + m + '</ul>'; });
  result = result.replace(/^---$/gm, '<hr class="border-border/30 my-5" />');
  return result.split(/\n\n+/).map(function(block) {
    var b = block.trim();
    if (!b) return "";
    if (b.startsWith("<")) return b;
    return '<p class="text-foreground/85 leading-[1.85] mb-4">' + b.replace(/\n/g, "<br/>") + '</p>';
  }).join("\n");
}


interface ReadingData {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_city: string;
  year_stem: string;
  year_branch: string;
  month_stem: string;
  month_branch: string;
  day_stem: string;
  day_branch: string;
  hour_stem: string;
  hour_branch: string;
  day_master_element: string;
  day_master_yinyang: string;
  archetype: string;
  ten_god: string;
  harmony_score: number;
  dominant_element: string;
  weakest_element: string;
  elements_wood: number;
  elements_fire: number;
  elements_earth: number;
  elements_metal: number;
  elements_water: number;
  free_reading_personality: string;
  free_reading_year: string;
  free_reading_element: string;
  paid_reading_career: string | null;
  paid_reading_love: string | null;
  paid_reading_health: string | null;
  paid_reading_decade: string | null;
  paid_reading_monthly: string | null;
  paid_reading_hidden_talent: string | null;
  is_paid: boolean;
  share_slug: string;
  created_at: string;
  user_id: string | null;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#59DE9B",
  fire: "#EF4444",
  earth: "#F2CA50",
  metal: "#C0C0C0",
  water: "#3B82F6",
};

const dateLocaleMap = { en: "en-US", ko: "ko-KR", ja: "ja-JP" } as const;


export default function ReadingPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, openSignInModal } = useAuth();
  const { locale } = useLanguage();
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paidContentLoading, setPaidContentLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [paidGenerationFailed, setPaidGenerationFailed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const isPaidGeneratingRef = useRef(false);
  const fetchAttemptedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [partialPaidReading, setPartialPaidReading] = useState<ReadingData | null>(null);

  // ═══ PROGRESSIVE RENDERING — helpers ═══
  const PAID_FIELDS = [
    "paid_reading_career", "paid_reading_love", "paid_reading_health",
    "paid_reading_decade", "paid_reading_monthly", "paid_reading_hidden_talent",
  ] as const;

  const countPaidFields = (r: ReadingData): number =>
    PAID_FIELDS.filter((f) => r[f] && (r[f] as string).length > 10).length;

  // Stop polling helper
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Fetch reading via server API — avoids supabase client session hang
  const fetchReadingAPI = async (shareSlug: string): Promise<ReadingData | null> => {
    try {
      const res = await fetch("/api/reading/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json.reading as ReadingData) || null;
    } catch { return null; }
  };

  // ═══ PAYMENT RETURN DETECTION — synchronous, before any useEffect ═══
  const [isPaymentReturn] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("payment") === "success" && !!params.get("session_id");
  });
  const [paymentSessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("session_id") || "";
  });

  // Reset payment loading when user returns from LemonSqueezy (browser tab regains focus)
  useEffect(() => {
    const handleFocus = () => { setPaymentLoading(false); };
    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setPaymentLoading(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Claim reading for logged-in user
  useEffect(() => {
    if (!user || !reading || claimed) return;
    if (reading.user_id) {
      setClaimed(reading.user_id === user.id);
      return;
    }
    try {
      const raw = safeGet("saju-data");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.chart?.name !== reading.name) return;
    } catch { return; }
    (async () => {
      try {
        const res = await fetch("/api/reading/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug: reading.share_slug, userId: user.id }),
        });
        if (res.ok) setClaimed(true);
      } catch {}
    })();
  }, [user, reading, claimed]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Warn user before leaving during generation
  useEffect(() => {
    if (!paidContentLoading) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your reading is being generated. If you leave now, you may need to wait again.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [paidContentLoading]);

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Reusable fetch reading function — uses server API to bypass supabase client session issues
  const doFetchReading = useCallback(async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500;

    console.log(`[reading-client] doFetchReading start slug=${slug}`);
    let data: ReadingData | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      }
      try {
        const res = await fetch("/api/reading/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug: slug }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.reading) {
            data = json.reading as ReadingData;
            console.log(`[reading-client] fetch success attempt=${attempt + 1}`);
            break;
          }
        }
        console.warn(`[reading-client] fetch attempt=${attempt + 1} status=${res.status}`);
      } catch (err) {
        console.warn(`[reading-client] fetch attempt=${attempt + 1} error:`, err);
      }
    }

    if (!data) {
      console.error("[reading-client] all retries failed — showing error");
      setError("Reading not found");
      setLoading(false);
      return null;
    }

    setReading(data);
    setLoading(false);
    return data;
  }, [slug]);

  // ═══ PROGRESSIVE RENDERING — poll DB for partial results (preview mode) ═══
  const startProgressivePolling = () => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/reading/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug: slug }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!json.reading) return;
        const rd = json.reading as ReadingData;
        const count = countPaidFields(rd);
        if (count > 0) {
          setPartialPaidReading(rd);
          setGenerationStep(count);
        }
        // All 6 done via polling — stop early
        if (count >= 6) {
          stopPolling();
          setReading(rd);
          setPartialPaidReading(null);
          setPaidContentLoading(false);
          isPaidGeneratingRef.current = false;
          safeSet("dashboard-stale", "true");
        }
      } catch {}
    }, 2500);
  };

  // Generate paid content — fires API + polls DB for progressive rendering
  const generatePaidContent = async () => {
    if (isPaidGeneratingRef.current) return;
    isPaidGeneratingRef.current = true;
    setPaidContentLoading(true);
    setPaidGenerationFailed(false);
    setGenerationStep(0);

    setTimeout(() => {
      document.getElementById("generation-progress")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    // Start polling DB for progressive rendering
    startProgressivePolling();

    try {
      const res = await fetch("/api/reading/generate-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: slug, locale }),
      });
      const data = await res.json();
      stopPolling();

      // Final fetch to get complete state
      const finalData = await fetchReadingAPI(slug);
      if (finalData) {
        const rd = finalData as ReadingData;
        setReading(rd);
        setPartialPaidReading(null);
        const count = countPaidFields(rd);
        setGenerationStep(count);

        if (!res.ok || data.error) {
          console.error("Paid generation failed:", data.error);
          if (count === 0) setPaidGenerationFailed(true);
        }
      } else if (!res.ok || data.error) {
        setPaidGenerationFailed(true);
      }

      setPartialPaidReading(null);
      setPaidContentLoading(false);
      isPaidGeneratingRef.current = false;

      try {
        const userId = user?.id;
        if (userId) {
          safeRemove(`dashboard-readings-${userId}`);
          safeRemove(`dashboard-compat-${userId}`);
        }
      } catch {}
      safeSet("dashboard-stale", "true");
    } catch (err) {
      stopPolling();
      console.error("Paid generation error:", err);
      // Check if partial results were saved
      try {
        const finalData = await fetchReadingAPI(slug);
        if (finalData) {
          const rd = finalData as ReadingData;
          const count = countPaidFields(rd);
          if (count > 0) {
            setReading(rd);
            setGenerationStep(count);
          } else {
            setPaidGenerationFailed(true);
          }
        } else {
          setPaidGenerationFailed(true);
        }
      } catch {
        setPaidGenerationFailed(true);
      }
      setPartialPaidReading(null);
      setPaidContentLoading(false);
      isPaidGeneratingRef.current = false;
    }
  };

  // ═══ NORMAL FLOW — fetch reading on mount (skipped for payment returns) ═══
  // Readings are publicly readable — no auth needed for initial fetch
  useEffect(() => {
    console.log(`[reading-client] normal flow: slug=${slug} isPaymentReturn=${isPaymentReturn}`);
    if (isPaymentReturn || !slug) return;

    fetchAttemptedRef.current = true;

    (async () => {
      const data = await doFetchReading();
      if (data) {
        window.scrollTo({ top: 0 });
        if (data.is_paid && !data.paid_reading_career) {
          setPaidContentLoading(true);
          generatePaidContent();
        }
      }
    })();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ AUTH RETURN FIX — re-fetch if login just completed while we're stuck loading ═══
  // After OAuth callback redirect, supabase session may not be ready on first fetch.
  // When user state appears (auth complete), retry if reading is still null.
  useEffect(() => {
    if (!user || reading || !loading || isPaymentReturn || !slug) return;
    // Only retry if first fetch was already attempted
    if (!fetchAttemptedRef.current) return;

    const timer = setTimeout(async () => {
      const data = await doFetchReading();
      if (data) {
        window.scrollTo({ top: 0 });
        if (data.is_paid && !data.paid_reading_career) {
          setPaidContentLoading(true);
          generatePaidContent();
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ SAFETY TIMEOUT — prevent infinite loading state ═══
  useEffect(() => {
    if (!loading || reading || error) return;
    const safety = setTimeout(() => {
      if (loading && !reading && !error) {
        console.warn("[reading-client] Safety timeout 5s — forcing fetch retry");
        doFetchReading();
      }
    }, 5000);
    return () => clearTimeout(safety);
  }, [loading, reading, error]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ PAYMENT RETURN FLOW — sequential pipeline + progressive polling ═══
  useEffect(() => {
    if (!isPaymentReturn || !slug || !paymentSessionId) return;

    window.history.replaceState({}, "", `/reading/${slug}`);

    // Show generation loading immediately
    setPaidContentLoading(true);
    setGenerationStep(0);

    (async () => {
      try {
        // Step 1: Verify payment
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: paymentSessionId, shareSlug: slug }),
        }).catch(() => {});

        // Step 2: Fetch reading
        let readingData: ReadingData | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
          const data = await fetchReadingAPI(slug);
          if (data) {
            readingData = data as ReadingData;
            break;
          }
        }

        if (!readingData) {
          setError("Reading not found");
          setLoading(false);
          setPaidContentLoading(false);
          return;
        }

        setReading(readingData);
        setLoading(false);

        // Scroll to generation progress after page renders
        setTimeout(() => {
          const el = document.getElementById("generation-progress");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);

        // Step 3: Generate paid content if needed (uses progressive polling)
        if (!readingData.paid_reading_career) {
          isPaidGeneratingRef.current = true;

          // Start progressive polling
          startProgressivePolling();

          try {
            const res = await fetch("/api/reading/generate-paid", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shareSlug: slug, locale }),
            });
            const result = await res.json();
            stopPolling();

            // Final fetch
            const finalData = await fetchReadingAPI(slug);
            if (finalData) {
              const rd = finalData as ReadingData;
              setReading(rd);
              setPartialPaidReading(null);
              const count = countPaidFields(rd);
              setGenerationStep(count);

              if (!res.ok || result.error) {
                console.error("Paid generation failed:", result.error);
                if (count === 0) setPaidGenerationFailed(true);
              }
            } else if (!res.ok || result.error) {
              setPaidGenerationFailed(true);
            }

            setPartialPaidReading(null);
            setPaidContentLoading(false);
            isPaidGeneratingRef.current = false;

            try {
              const userId = user?.id;
              if (userId) {
                safeRemove(`dashboard-readings-${userId}`);
                safeRemove(`dashboard-compat-${userId}`);
              }
            } catch {}
            safeSet("dashboard-stale", "true");
          } catch (err) {
            stopPolling();
            console.error("Paid generation error:", err);
            // Check partial results
            try {
              const fd = await fetchReadingAPI(slug);
              if (fd) {
                const rd = fd as ReadingData;
                const count = countPaidFields(rd);
                if (count > 0) {
                  setReading(rd);
                  setGenerationStep(count);
                } else {
                  setPaidGenerationFailed(true);
                }
              }
            } catch { setPaidGenerationFailed(true); }
            setPartialPaidReading(null);
            setPaidContentLoading(false);
            isPaidGeneratingRef.current = false;
          }
        } else {
          setPaidContentLoading(false);
          setTimeout(() => {
            const el = document.getElementById("paid-content");
            if (el) {
              const yOffset = -80;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }, 600);
        }
      } catch (err) {
        stopPolling();
        console.error("Payment flow error:", err);
        const data = await fetchReadingAPI(slug);
        if (data) {
          setReading(data as ReadingData);
          setLoading(false);
        }
        setPaidContentLoading(false);
      }
    })();

    return () => stopPolling();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle payment=cancelled
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "cancelled") {
      window.history.replaceState({}, "", `/reading/${slug}`);
      setPaymentLoading(false);
    }
  }, [slug]);

  const handleUnlock = async () => {
    if (!reading) return;
    if (!user) {
      safeSet("auth-return-url", window.location.href);
      openSignInModal();
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareSlug: reading.share_slug, readingName: reading.name, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPaymentLoading(false);
    }
  };

  // ═══ LOADING STATES ═══
  if (loading && isPaymentReturn) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 h-6 w-24 bg-muted/30 rounded animate-pulse" />
            {paidContentLoading && (
              <PaymentReturnProgress generationStep={generationStep} locale={locale} />
            )}
            {!paidContentLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">{t("reading.loading", locale)}</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-8 h-6 w-24 bg-muted/30 rounded animate-pulse" />
            <div className="mb-6 bg-card/80 border border-primary/20 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted/30 rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted/20 rounded w-1/3" />
            </div>
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">{t("reading.loading", locale)}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !reading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-serif text-primary mb-4">{t("reading.notFound", locale)}</h1>
          <p className="text-muted-foreground mb-8">{t("reading.notFoundDesc", locale)}</p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground">{t("reading.getFree", locale)}</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const dmKey = `${reading.day_master_element}-${reading.day_master_yinyang}`;
  const dmDisplay = DAY_MASTER_DISPLAY[dmKey] || { zh: "?", en: "Unknown" };
  const dmColor = ELEMENT_COLORS[reading.day_master_element] || "#F2CA50";

  const pillars = [
    { name: t("reading.pillarHour", locale), stem: reading.hour_stem, branch: reading.hour_branch, isDay: false },
    { name: t("reading.pillarDay", locale), stem: reading.day_stem, branch: reading.day_branch, isDay: true },
    { name: t("reading.pillarMonth", locale), stem: reading.month_stem, branch: reading.month_branch, isDay: false },
    { name: t("reading.pillarYear", locale), stem: reading.year_stem, branch: reading.year_branch, isDay: false },
  ];

  const elements = {
    wood: reading.elements_wood,
    fire: reading.elements_fire,
    earth: reading.elements_earth,
    metal: reading.elements_metal,
    water: reading.elements_water,
  };

  const maxElement = Math.max(...Object.values(elements));

  const genSteps = [
    { icon: "💰", title: t("reading.genStep1", locale), sub: t("reading.genStep1Sub", locale) },
    { icon: "💕", title: t("reading.genStep2", locale), sub: t("reading.genStep2Sub", locale) },
    { icon: "🌿", title: t("reading.genStep3", locale), sub: t("reading.genStep3Sub", locale) },
    { icon: "🔮", title: t("reading.genStep4", locale), sub: t("reading.genStep4Sub", locale) },
    { icon: "📅", title: t("reading.genStep5", locale), sub: t("reading.genStep5Sub", locale) },
    { icon: "✨", title: t("reading.genStep6", locale), sub: t("reading.genStep6Sub", locale) },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button onClick={() => user ? router.push("/dashboard") : router.push("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> {user ? t("nav.dashboard", locale) : t("nav.home", locale)}
            </button>
          </motion.div>

          {/* Save & Share Banner */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mb-6 bg-card/80 border border-primary/20 rounded-xl p-4">
            {user && (reading.user_id === user.id || claimed) ? (
              <div className="flex items-center justify-between gap-3">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Bookmark className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t("reading.savedDash", locale)}</p>
                    <p className="text-xs text-muted-foreground">{t("reading.tapDash", locale)}</p>
                  </div>
                </Link>
                <Button variant="outline" size="sm" className="text-xs h-9 gap-2 shrink-0" onClick={handleShareLink}>
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {linkCopied ? t("common.copied", locale) : t("common.copyLink", locale)}
                </Button>
              </div>
            ) : user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{t("reading.wantOwn", locale)}</p>
                    <p className="text-xs text-muted-foreground">{t("reading.discover30s", locale)}</p>
                  </div>
                </div>
                <Link href="/calculate">
                  <Button size="sm" className="text-xs h-9 gold-gradient text-primary-foreground shrink-0">{t("reading.getMineFree", locale)}</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Bookmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{t("reading.saveShare", locale)}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t("reading.saveShareDesc", locale)}</p>
                  <Button variant="outline" size="sm" className="text-xs h-9 gap-2" onClick={openSignInModal}>
                    <GoogleIcon />
                    {t("signIn.continueGoogle", locale)}
                  </Button>
                  <p className="text-[10px] text-muted-foreground/50 mt-2">{t("reading.free3s", locale)}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif mb-2">
              {reading.name}&apos;s <span className="gold-gradient-text">{t("reading.cosmicBlueprint", locale)}</span>
            </h1>
            <p className="text-muted-foreground mb-3">
              {t("reading.born", locale)}{" "}
              {new Date(reading.birth_date).toLocaleDateString(dateLocaleMap[locale], { year: "numeric", month: "long", day: "numeric" })}{" "}
              in {reading.birth_city}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                {t("reading.dayMaster", locale)}: <span style={{ color: dmColor }} className="font-semibold">{dmDisplay.zh} {dmDisplay.en}</span>
              </span>
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                {t("reading.archetype", locale)}: <span className="text-primary font-semibold">{reading.archetype}</span>
              </span>
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                {t("reading.harmony", locale)}: <span className="text-primary font-semibold">{reading.harmony_score}%</span>
              </span>
            </div>
          </motion.section>

          {/* Four Pillars */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4 text-center">{t("reading.fourPillars", locale)}</h2>
            <div className="grid grid-cols-4 gap-3">
              {pillars.map((p) => (
                <div key={p.name}
                  className={`bg-card/60 backdrop-blur border rounded-xl p-4 text-center ${p.isDay ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
                  <p className="text-xs text-muted-foreground mb-2">{p.name}</p>
                  <p className="text-2xl font-serif text-primary">{p.stem}</p>
                  <p className="text-lg text-muted-foreground">{p.branch}</p>
                  {p.isDay && <p className="text-[10px] text-primary/60 mt-1">{t("reading.dayMasterLabel", locale)}</p>}
                </div>
              ))}
            </div>
          </motion.section>

          {/* AI Personality Reading */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
            <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-serif" style={{ color: dmColor }}>{dmDisplay.zh}</span>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold">{reading.archetype}</h2>
                  <p className="text-xs text-muted-foreground">{dmDisplay.en} · {reading.ten_god}</p>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85] prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.free_reading_personality) }} />
              </div>
            </div>
          </motion.section>

          {/* Five Elements Balance */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
            <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.fiveElements", locale)}</h2>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <div className="space-y-3 mb-6">
                {(["wood", "fire", "earth", "metal", "water"] as const).map((el) => (
                  <div key={el} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground">{t(`element.${el}`, locale)}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${maxElement > 0 ? (elements[el] / maxElement) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ backgroundColor: ELEMENT_COLORS[el] }}
                      >
                        <span className="text-xs font-semibold text-background">{elements[el]}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reading.free_reading_element}
                </p>
              </div>
            </div>
          </motion.section>

          {/* This Year's Fortune */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-10">
            <h2 className="font-serif text-xl font-semibold mb-4">{new Date().getFullYear()} {t("reading.fortuneForecast", locale)}</h2>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85] prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.free_reading_year) }} />
              </div>
            </div>
          </motion.section>

          {/* Harmony Score */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-10">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t("reading.harmonyScore", locale)}</p>
              <div className="text-5xl font-serif text-primary mb-2">{reading.harmony_score}</div>
              <p className="text-sm text-muted-foreground">
                {reading.harmony_score >= 80
                  ? t("reading.harmonyHigh", locale)
                  : reading.harmony_score >= 60
                  ? t("reading.harmonyMid", locale)
                  : t("reading.harmonyLow", locale)}
              </p>
            </div>
          </motion.section>

          {/* Compatibility CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mb-10">
            <Link href={`/compatibility?my=${reading.share_slug}`}
              className="block bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 text-center hover:border-pink-500/40 transition-colors">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold mb-1">{t("reading.checkCompat", locale)}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {t("reading.checkCompatDesc", locale)}
              </p>
            </Link>
          </motion.section>

          {/* Paid Content — progressive rendering: show each section as it becomes available */}
          {reading.is_paid && (reading.paid_reading_career || reading.paid_reading_love || reading.paid_reading_health || reading.paid_reading_decade || reading.paid_reading_monthly || reading.paid_reading_hidden_talent) && (
            <div id="paid-content">
              {reading.paid_reading_career && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.careerWealth", locale)}</h2>
                <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_career) }} />
                  </div>
                </div>
              </motion.section>
              )}

              {reading.paid_reading_love && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.loveRelation", locale)}</h2>
                  <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_love) }} />
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_health && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.healthWellness", locale)}</h2>
                  <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_health) }} />
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_decade && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.decadeCycle", locale)}</h2>
                  <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_decade) }} />
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_monthly && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-10">
                  <h2 className="font-serif text-xl font-semibold mb-4">{t("reading.monthlyEnergy", locale)}</h2>
                  <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
                    <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_monthly) }} />
                    </div>
                  </div>
                </motion.section>
              )}

              {reading.paid_reading_hidden_talent && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mb-10">
                  <div className="bg-gradient-to-br from-primary/5 via-card/80 to-purple-500/5 backdrop-blur border border-primary/30 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="font-serif text-xl font-semibold">{t("reading.hiddenTalent", locale)}</h2>
                        <p className="text-xs text-primary/60">{t("reading.hiddenTalentSub", locale)}</p>
                      </div>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(reading.paid_reading_hidden_talent) }} />
                    </div>
                  </div>
                </motion.section>
              )}
            </div>
          )}

          {/* Paid content generation failed — retry button */}
          {reading.is_paid && !(reading.paid_reading_career || reading.paid_reading_love || reading.paid_reading_health || reading.paid_reading_decade || reading.paid_reading_monthly || reading.paid_reading_hidden_talent) && !paidContentLoading && paidGenerationFailed && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="bg-card/80 border border-red-500/30 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{t("reading.genFailed", locale)}</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  {t("reading.genFailedDesc", locale)}
                </p>
                <Button
                  className="gold-gradient text-primary-foreground font-semibold px-8"
                  onClick={generatePaidContent}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("reading.retryGen", locale)}
                </Button>
                <p className="text-xs text-muted-foreground/50 mt-3">
                  {t("reading.retryPersist", locale)}
                </p>
              </div>
            </motion.section>
          )}

          {/* Locked Premium Content (visible when NOT paid) */}
          {!reading.is_paid && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-10">
              <div className="relative overflow-hidden rounded-2xl border border-border" style={{ minHeight: 280 }}>
                <div className="p-6 blur-sm select-none pointer-events-none">
                  <h2 className="font-serif text-lg font-semibold mb-2">{t("reading.decadeCycle", locale)}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your next decade holds remarkable potential. The elemental shifts in your luck pillars suggest...
                  </p>
                  <h2 className="font-serif text-lg font-semibold mb-2 mt-4">{t("reading.careerWealth", locale)} · {t("reading.loveRelation", locale)} · {t("reading.healthWellness", locale)}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your unique combination of elements creates a natural affinity for roles that require both vision and execution...
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background flex items-end justify-center pb-6">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-1">{t("reading.unlockFull", locale)}</h3>
                    <p className="text-muted-foreground text-xs mb-3 max-w-xs mx-auto">
                      {t("reading.unlockDesc", locale)}
                    </p>
                    <Button 
                      className="gold-gradient text-primary-foreground font-semibold px-8"
                      onClick={handleUnlock}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          {t("reading.processing", locale)}
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t("reading.unlockBtn", locale)}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground/50 mt-2">{t("reading.oneTime", locale)}</p>
                    <p className="text-xs text-primary/60 mt-1">{t("reading.compatFree", locale)}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Payment processing — Step-by-step generation progress */}
          {paidContentLoading && (
            <motion.section id="generation-progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
              <div className="bg-card/80 backdrop-blur border border-primary/30 rounded-2xl p-6 md:p-10 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
                </div>

                <div className="relative">
                  {/* Warning at TOP — most visible position */}
                  <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-amber-400/80 text-center font-medium">
                      ⚠️ {t("reading.doNotLeave", locale)}
                    </p>
                  </div>

                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary/30 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </motion.div>
                    <h3 className="font-serif text-xl text-primary mb-1">{t("reading.craftingFull", locale)}</h3>
                    <p className="text-xs text-muted-foreground">{t("reading.threeScholars", locale)}</p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto">
                    {genSteps.map((step, i) => {
                      const isActive = generationStep === i;
                      const isDone = generationStep > i;
                      return (
                        <motion.div
                          key={i}
                          ref={isActive ? (el: HTMLDivElement | null) => { if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); } : undefined}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                            isActive ? "bg-primary/10 border border-primary/30" : isDone ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            {isDone ? (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">✅</motion.span>
                            ) : isActive ? (
                              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-lg">{step.icon}</motion.span>
                            ) : (
                              <span className="text-lg opacity-30">{step.icon}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.title}
                            </p>
                            {isActive && (
                              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground truncate">
                                {step.sub}
                              </motion.p>
                            )}
                          </div>
                          {isDone && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary/60">{t("reading.genDone", locale)}</motion.span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-6 h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min((generationStep / 6) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground/50 mt-3">
                    {t("reading.genTakes", locale)}
                  </p>
                </div>
              </div>

              {/* Preview panel — show partial results while generating */}
              {partialPaidReading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="bg-card/50 border border-primary/20 rounded-2xl overflow-hidden">
                    <div className="px-6 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-primary font-medium">
                        {locale === "ko" ? "미리보기 — 생성 중..." : locale === "ja" ? "プレビュー — 生成中..." : "Preview — generating..."}
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      {partialPaidReading.paid_reading_career && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.careerWealth", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_career) }} />
                        </div>
                      )}
                      {partialPaidReading.paid_reading_love && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.loveRelation", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_love) }} />
                        </div>
                      )}
                      {partialPaidReading.paid_reading_health && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.healthWellness", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_health) }} />
                        </div>
                      )}
                      {partialPaidReading.paid_reading_decade && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.decadeCycle", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_decade) }} />
                        </div>
                      )}
                      {partialPaidReading.paid_reading_monthly && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.monthlyEnergy", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_monthly) }} />
                        </div>
                      )}
                      {partialPaidReading.paid_reading_hidden_talent && (
                        <div>
                          <h3 className="font-serif text-lg font-semibold mb-3">{t("reading.hiddenTalent", locale)}</h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:leading-[1.85]" dangerouslySetInnerHTML={{ __html: renderPaidMarkdown(partialPaidReading.paid_reading_hidden_talent) }} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}

          {/* Bottom CTA */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10">
            {user ? (
              <div className="bg-card/80 border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-serif text-lg font-semibold mb-1">{t("reading.shareReading", locale)}</h3>
                  <p className="text-sm text-muted-foreground">{t("reading.shareSub", locale)}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2" onClick={handleShareLink}>
                    {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {linkCopied ? t("common.copied", locale) : t("common.copyLink", locale)}
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline" className="gap-2">
                      <Bookmark className="w-4 h-4" />
                      {t("nav.dashboard", locale)}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="gold-gradient rounded-2xl p-8 text-center">
                <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-2">{t("reading.shareCosmicId", locale)}</h3>
                <p className="text-primary-foreground/80 mb-4">{t("reading.shareCosmicIdSub", locale)}</p>
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90 gap-2" onClick={openSignInModal}>
                  <GoogleIcon />
                  {t("signIn.continueGoogle", locale)}
                </Button>
              </div>
            )}
          </motion.section>

        </div>
      </div>
      <Footer />
    </main>
  );
}

// ═══ Payment Return Progress Component ═══
function PaymentReturnProgress({ generationStep, locale }: { generationStep: number; locale: string }) {
  const genSteps = [
    { icon: "💰", title: t("reading.genStep1", locale), sub: t("reading.genStep1Sub", locale) },
    { icon: "💕", title: t("reading.genStep2", locale), sub: t("reading.genStep2Sub", locale) },
    { icon: "🌿", title: t("reading.genStep3", locale), sub: t("reading.genStep3Sub", locale) },
    { icon: "🔮", title: t("reading.genStep4", locale), sub: t("reading.genStep4Sub", locale) },
    { icon: "📅", title: t("reading.genStep5", locale), sub: t("reading.genStep5Sub", locale) },
    { icon: "✨", title: t("reading.genStep6", locale), sub: t("reading.genStep6Sub", locale) },
  ];

  return (
    <div className="bg-card/80 backdrop-blur border border-primary/30 rounded-2xl p-6 md:p-10 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>
      <div className="relative">
        {/* Warning at TOP */}
        <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5">
          <p className="text-xs text-amber-400/80 text-center font-medium">
            ⚠️ {t("reading.doNotLeave", locale)}
          </p>
        </div>

        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary/30 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </motion.div>
          <h3 className="font-serif text-xl text-primary mb-1">{t("reading.craftingFull", locale)}</h3>
          <p className="text-xs text-muted-foreground">{t("reading.threeScholars", locale)}</p>
        </div>
        <div className="space-y-3 max-w-md mx-auto">
          {genSteps.map((step, i) => {
            const isActive = generationStep === i;
            const isDone = generationStep > i;
            return (
              <motion.div
                key={i}
                ref={isActive ? (el: HTMLDivElement | null) => { if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); } : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  isActive ? "bg-primary/10 border border-primary/30" : isDone ? "bg-primary/5" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  {isDone ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">✅</motion.span>
                  ) : isActive ? (
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-lg">{step.icon}</motion.span>
                  ) : (
                    <span className="text-lg opacity-30">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                  {isActive && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground truncate">
                      {step.sub}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-6 h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min((generationStep / 6) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-3">
          {t("reading.genTakes", locale)}
        </p>
      </div>
    </div>
  );
}
