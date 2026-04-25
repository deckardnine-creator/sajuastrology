"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  FileText,
  ExternalLink,
  Share2,
  Star,
  Check,
  Heart,
  LogOut,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { t, tf, toBCP47 } from "@/lib/translations";
import { useNativeApp } from "@/lib/native-app";
import { supabase } from "@/lib/supabase-client";
import { ELEMENTS, calculateDailyEnergy, type Element } from "@/lib/saju-calculator";
import type { SajuChart } from "@/lib/saju-calculator";
import { reconstructChartFromReading, getElementColor } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ConsultationHistory } from "@/components/consultation/consultation-history";
import { RestorePurchasesButton } from "@/components/dashboard/restore-purchases-button";
import { safeGet, safeSet, safeRemove } from "@/lib/safe-storage";
import { track, Events } from "@/lib/analytics";

interface SavedReading {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_city: string;
  share_slug: string;
  archetype: string;
  ten_god: string;
  harmony_score: number;
  day_master_element: string;
  day_master_yinyang: string;
  dominant_element: string;
  weakest_element: string;
  year_stem: string; year_branch: string;
  month_stem: string; month_branch: string;
  day_stem: string; day_branch: string;
  hour_stem: string; hour_branch: string;
  elements_wood: number; elements_fire: number; elements_earth: number;
  elements_metal: number; elements_water: number;
  is_paid: boolean;
  created_at: string;
}

interface CompatResult {
  id: string;
  person_a_name: string;
  person_b_name: string;
  person_a_element: string;
  person_b_element: string;
  overall_score: number;
  share_slug: string;
  created_at: string;
}

// ─── v1.3 Sprint 2-B: Soram + subscription types ───
interface SoramUsage {
  tier: "free" | "subscriber";
  canAskToday: boolean;
  remainingToday: number;
  subscriptionEnd: string | null;
  hasPrimaryChart: boolean;
  userName: string | null;
}

interface SoramHistoryItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  score: number;
}

interface ConsultationCreditSummary {
  totalRemaining: number;
}

const READING_COLS = "id,name,gender,birth_date,birth_city,share_slug,archetype,ten_god,harmony_score,day_master_element,day_master_yinyang,dominant_element,weakest_element,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,is_paid,created_at";

export function DashboardContent() {
  const { user, sajuData, saveSajuChart, claimTrigger, signOut, isLoading } = useAuth();
  const { t, locale } = useLanguage();
  const isNative = useNativeApp();

  // Prevent 1-frame flash of empty dashboard before sign-in modal appears.
  // When auth is still loading OR user is confirmed null, render nothing —
  // the sign-in modal (rendered by the parent page) will cover the screen.
  if (isLoading || !user) {
    return null;
  }

  return <DashboardInner />;
}

function DashboardInner() {
  const { user, sajuData, saveSajuChart, claimTrigger, signOut } = useAuth();
  const { t, locale } = useLanguage();
  const isNative = useNativeApp();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);

  // ── Mixpanel: dashboard view — fires once per mount (not on re-renders) ──
  // Key VC-facing metric: "dashboard views" proxies active engagement.
  useEffect(() => {
    try {
      track(Events.dashboard_viewed, {
        platform: isNative ? "native" : "web",
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [readingsLoaded, setReadingsLoaded] = useState(false);
  const [primaryReadingId, setPrimaryReadingId] = useState<string | null>(null);
  const [canChangeToday, setCanChangeToday] = useState(true);
  const [switchMessage, setSwitchMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0); // 0=idle, 1=first tap, 2=deleting
  const [compatResults, setCompatResults] = useState<CompatResult[]>([]);

  // ─── v1.3 Sprint 2-B: Soram usage + recent conversations + credits ───
  // Loaded async after mount; UI degrades gracefully when fetch fails
  // (renders the cards with skeleton/placeholder state, never throws).
  const [soramUsage, setSoramUsage] = useState<SoramUsage | null>(null);
  const [soramHistory, setSoramHistory] = useState<SoramHistoryItem[]>([]);
  const [soramHistoryLoaded, setSoramHistoryLoaded] = useState(false);
  // v1.3 Sprint 2-B follow-up: dashboard surfaces 5 by default, expands
  // to 10 on tap. We fetch 10 up front so "Show more" is instantaneous
  // (no extra request, no loading flicker).
  const [soramHistoryExpanded, setSoramHistoryExpanded] = useState(false);
  const [consultCredits, setConsultCredits] = useState<number | null>(null);

  const todayLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());

  useEffect(() => {
    setMounted(true);
    const savedPrimary = safeGet("primary-reading-id");
    if (savedPrimary) setPrimaryReadingId(savedPrimary);
    const lastChanged = safeGet("primary-changed-date");
    if (lastChanged === todayLocal) setCanChangeToday(false);
  }, [todayLocal]);

  // ═══ SERVER API FETCH — bypasses supabase client session hang ═══
  const fetchDashboardData = async (opts?: { skipCache?: boolean; claimSlugs?: string[]; claimName?: string }) => {
    if (!user) return;
    try {
      const res = await fetch("/api/dashboard/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          claimCompatSlugs: opts?.claimSlugs,
          claimCompatName: opts?.claimName,
        }),
      });
      if (!res.ok) return;
      const { readings, compat } = await res.json();

      if (readings) {
        setSavedReadings(readings);
        setReadingsLoaded(true);
        try { safeSet(`dashboard-readings-${user.id}`, JSON.stringify(readings)); } catch {}

        const currentPrimary = safeGet("primary-reading-id");
        if (readings.length > 0) {
          const primaryExists = readings.some((r: SavedReading) => r.id === currentPrimary);
          if (!currentPrimary || !primaryExists) {
            const d = readings[0];
            setPrimaryReadingId(d.id);
            safeSet("primary-reading-id", d.id);
            if (!sajuData.chart) saveSajuChart(reconstructChartFromReading(d) as SajuChart);
          }
        }
      }

      if (compat) {
        setCompatResults(compat);
        try { safeSet(`dashboard-compat-${user.id}`, JSON.stringify(compat)); } catch {}
      }
    } catch {}
  };

  // Re-fetch when tab regains focus
  useEffect(() => {
    if (!user) return;
    const handleFocus = () => fetchDashboardData();
    const handleVisibility = () => { if (document.visibilityState === "visible") fetchDashboardData(); };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sajuData.chart) setDailyScore(calculateDailyEnergy(sajuData.chart, new Date()));
  }, [sajuData.chart]);

  // ════════════════════════════════════════════════════════════════
  // v1.3 Sprint 2-B: Load Soram usage, recent conversations, and
  // consultation credits in parallel. All three are independent and
  // each fails silently — partial data is fine, no error must block
  // the rest of the dashboard render.
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    // Soram usage (tier, remainingToday, hasPrimaryChart)
    (async () => {
      try {
        const res = await fetch("/api/v1/soram/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!res.ok) return;
        const u = (await res.json()) as SoramUsage;
        if (!cancelled) setSoramUsage(u);
      } catch {}
    })();

    // Soram conversation history (most recent 10 — dashboard shows 5
    // initially and expands to 10 on "Show more" tap, no second request).
    (async () => {
      try {
        const res = await fetch("/api/v1/soram/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, limit: 10 }),
        });
        if (!res.ok) {
          if (!cancelled) setSoramHistoryLoaded(true);
          return;
        }
        const h = await res.json();
        if (!cancelled) {
          setSoramHistory(Array.isArray(h.messages) ? h.messages : []);
          setSoramHistoryLoaded(true);
        }
      } catch {
        if (!cancelled) setSoramHistoryLoaded(true);
      }
    })();

    // Consultation credits — sums total_credits - used_credits across rows.
    // Reuses the same supabase client pattern as DashboardSidebar so we
    // don't duplicate auth handling here.
    (async () => {
      try {
        const { data } = await supabase
          .from("consultation_credits")
          .select("total_credits, used_credits")
          .eq("user_id", user.id);
        const remaining = (data || []).reduce(
          (sum, c: { total_credits: number; used_credits: number }) =>
            sum + (c.total_credits - c.used_credits),
          0
        );
        if (!cancelled) setConsultCredits(remaining);
      } catch {
        if (!cancelled) setConsultCredits(0);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Main data fetch on mount
  useEffect(() => {
    if (!user) return;

    // Check stale flag
    const isStale = safeGet("dashboard-stale") === "true";
    if (isStale) {
      safeRemove("dashboard-stale");
      safeRemove(`dashboard-readings-${user.id}`);
      safeRemove(`dashboard-compat-${user.id}`);
    }

    // Show cached data instantly (skip if stale)
    if (!isStale) {
      try {
        const cachedRaw = safeGet(`dashboard-readings-${user.id}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.length > 0) { setSavedReadings(cached); setReadingsLoaded(true); }
        }
      } catch {}
      try {
        const cachedRaw = safeGet(`dashboard-compat-${user.id}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.length > 0) setCompatResults(cached);
        }
      } catch {}
    }

    // Prepare claim data
    let claimSlugs: string[] | undefined;
    try {
      const pendingRaw = safeGet("pending-compat-slugs");
      if (pendingRaw) {
        claimSlugs = JSON.parse(pendingRaw) as string[];
        if (claimSlugs.length > 0) safeSet("pending-compat-slugs", "[]");
        else claimSlugs = undefined;
      }
    } catch {}

    fetchDashboardData({
      skipCache: isStale,
      claimSlugs,
      claimName: sajuData.chart?.name || undefined,
    });
  }, [user, claimTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAsMyChart = (readingId: string) => {
    if (primaryReadingId === readingId) return;
    if (!canChangeToday) {
      setSwitchMessage(t("dash.alreadySwitchedToday", locale));
      setTimeout(() => setSwitchMessage(""), 3000);
      return;
    }
    const r = savedReadings.find((rd) => rd.id === readingId);
    if (!r) return;
    const reconstructed = reconstructChartFromReading(r);
    saveSajuChart(reconstructed as SajuChart);
    setPrimaryReadingId(readingId);
    setCanChangeToday(false);
    safeSet("primary-reading-id", readingId);
    safeSet("primary-changed-date", todayLocal);
    setDailyScore(calculateDailyEnergy(reconstructed as SajuChart, new Date()));
    setSwitchMessage(`Switched to ${r.name}'s chart!`);
    setTimeout(() => setSwitchMessage(""), 2500);
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/reading/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const dateLocale = toBCP47(locale);
  const formattedDate = new Date().toLocaleDateString(dateLocale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const score = sajuData.chart ? Math.round(calculateDailyEnergy(sajuData.chart, d)) : 0;
      const wLocale = toBCP47(locale);
      return { day: d.toLocaleDateString(wLocale, { weekday: "short" }), dateNum: d.getDate(), score };
    });
  }, [sajuData.chart]);

  // Daily fortune state + effect REMOVED in v1.3 Sprint 2-B
  // (chandler #4: today's-fortune section deleted from dashboard)
  // Saves the 52KB lazy-imported fortune data on dashboard route too.

  // Empty state - only show after readings have been checked
  if (!sajuData.chart) {
    if (!readingsLoaded) {
      return (
        <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto text-center min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-serif text-primary mb-4">{t("dash.welcome")} {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm sm:text-base">
            {t("dash.emptyDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link href="/calculate">
              <Button className="gold-gradient text-primary-foreground h-12 px-6">
                <Sparkles className="w-4 h-4 mr-2" /> {t("dash.generateReading")}
              </Button>
            </Link>
            <Link href="/compatibility">
              <Button variant="outline" className="h-12 px-6">
                <Heart className="w-4 h-4 mr-2" /> {t("dash.viewCompat", locale)}
              </Button>
            </Link>
          </div>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-auto pt-8 pb-4 text-[11px] text-muted-foreground/50">
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
            {t("common.privacy", locale)}
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">
            {t("common.terms", locale)}
          </Link>
          <span>·</span>
          <a href="mailto:info@rimfactory.io" className="hover:text-muted-foreground transition-colors">
            {t("common.contact", locale)}
          </a>
          <span>·</span>
          <button
            onClick={async () => {
              if (deleteConfirmStep === 0) {
                setDeleteConfirmStep(1);
                setTimeout(() => setDeleteConfirmStep(0), 5000);
                return;
              }
              if (deleteConfirmStep === 1) {
                setDeleteConfirmStep(2);
                try {
                  let token = "";
                  // Method 1: getSession()
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) token = session.access_token;
                  } catch {}
                  // Method 2: localStorage sb-* keys (Supabase v2 format)
                  if (!token) {
                    for (let i = 0; i < localStorage.length; i++) {
                      const k = localStorage.key(i);
                      if (k && k.startsWith("sb-") && k.includes("auth-token")) {
                        try { const d = JSON.parse(localStorage.getItem(k) || ""); token = d.access_token || ""; } catch {}
                      }
                    }
                  }
                  // Method 3: scan all localStorage for any Supabase session shape
                  if (!token) {
                    for (let i = 0; i < localStorage.length; i++) {
                      const k = localStorage.key(i);
                      if (!k) continue;
                      try {
                        const raw = localStorage.getItem(k) || "";
                        if (raw.includes("access_token") && raw.includes("refresh_token")) {
                          const d = JSON.parse(raw);
                          if (d.access_token && typeof d.access_token === "string" && d.access_token.length > 20) {
                            token = d.access_token;
                            break;
                          }
                        }
                      } catch {}
                    }
                  }
                  // Method 4: try refreshing session first, then get token
                  if (!token) {
                    try {
                      const { data } = await supabase.auth.refreshSession();
                      if (data.session) token = data.session.access_token;
                    } catch {}
                  }
                  if (!token) { setDeleteConfirmStep(0); return; }
                  const res = await fetch("/api/account/delete", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  if (res.ok) { try { await signOut(); } catch {} window.location.href = isNative ? "/?app=true" : "/"; }
                  else { setDeleteConfirmStep(0); }
                } catch { setDeleteConfirmStep(0); }
              }
            }}
            className={deleteConfirmStep === 1 ? "text-red-400 font-medium animate-pulse transition-colors" : deleteConfirmStep === 2 ? "text-red-400/30 pointer-events-none" : "text-red-400/50 hover:text-red-400 transition-colors"}
          >
            {deleteConfirmStep === 2
              ? t("dash.deleting", locale)
              : deleteConfirmStep === 1
              ? t("dash.tapToConfirmDelete", locale)
              : t("dash.deleteAccount", locale)}
          </button>
        </div>
        {deleteConfirmStep === 1 && (
          <p className="text-[11px] text-red-400/80 text-center mt-2 animate-in fade-in duration-200">
            {t("dash.deleteWarning", locale)}
          </p>
        )}
      </div>
    );
  }

  const dayMasterElement = (sajuData.chart.dayMaster.element || "water") as Element;
  const dayMasterColor = ELEMENTS[dayMasterElement]?.color || "#F2CA50";

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground">
            Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        {!isNative && (
          <button
            onClick={async () => { try { await signOut(); } catch {} }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("nav.signOut")}
          </button>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════════
          v1.3 Sprint 2-B: NEW — Soram entry + Plan / remaining row
          Per chandler item #4: today's-fortune section is REMOVED;
          replaced with three pieces — Soram CTA, plan/remaining card,
          and (lower in the page) a conversation-backup section.
          This block sits at the very top of the dashboard so the
          v1.3 product centerpiece (Ask Soram) is the first thing
          a returning user sees on every load.

          v6 patch: hidden in native app (isNative=true).
          Reason — Soram entry flow is being polished over the next
          ~3 days. Native app users would otherwise hit a half-finished
          flow during that window. We hide BOTH the Soram CTA and the
          Plan/remaining card together because the Plan card surfaces
          Soram's "Daily Pass / remaining today" tier info — showing
          plan info while the actual entry is hidden would just cause
          confusion. When Soram is ready, removing the !isNative wrap
          (or shipping a new app build) restores the row.
      ════════════════════════════════════════════════════════════ */}
      {!isNative && (
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-5">

        {/* Soram entry card — primary CTA, 3/5 width on desktop */}
        <Link
          href="/soram"
          className="sm:col-span-3 group"
          aria-label={t("dash.soramAsk")}
        >
          <div className="relative h-full overflow-hidden rounded-xl border border-amber-400/35 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent backdrop-blur-sm p-4 sm:p-5 transition-all duration-200 hover:border-amber-300/60 hover:shadow-[0_8px_24px_rgba(234,179,8,0.22)] active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-amber-500/30 shrink-0">
                <span aria-hidden="true">🌙</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-amber-100 leading-snug truncate">
                  {t("dash.soramTitle", locale)}
                </p>
                <p className="text-[11px] sm:text-xs text-amber-200/70 leading-relaxed mt-0.5 line-clamp-2">
                  {soramUsage?.tier === "subscriber"
                    ? t("dash.soramDescSubscriber", locale)
                    : soramUsage?.canAskToday === false
                    ? t("dash.soramDescUsed", locale)
                    : t("dash.soramDescFree", locale)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-amber-100 bg-amber-500/15 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {t("dash.soramAsk", locale)}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-300/80 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </Link>

        {/* Plan + remaining card — secondary, 2/5 width on desktop */}
        <div className="sm:col-span-2 bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" />
              {t("dash.planTitle", locale)}
            </p>
            {soramUsage?.tier !== "subscriber" && (
              <Link
                href="/pricing?plan=daily_pass"
                className="text-[11px] text-amber-300/90 hover:text-amber-200 transition-colors min-h-[28px] flex items-center"
              >
                {t("dash.upgrade", locale)} →
              </Link>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-base font-semibold ${soramUsage?.tier === "subscriber" ? "text-amber-200" : "text-foreground"}`}>
              {soramUsage?.tier === "subscriber"
                ? t("dash.planDailyPass", locale)
                : t("dash.planFree", locale)}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("dash.remainingToday", locale)}</span>
              <span className="text-foreground font-medium">
                {soramUsage === null
                  ? "—"
                  : soramUsage.tier === "subscriber"
                  ? t("dash.unlimited", locale)
                  : `${soramUsage.remainingToday} / 1`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("dash.remainingConsult", locale)}</span>
              <span className="text-foreground font-medium">
                {consultCredits === null ? "—" : consultCredits}
              </span>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* Today's Energy + Day Master row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Energy Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("dash.todayEnergy")}</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                <motion.circle cx="32" cy="32" r="28" fill="none"
                  stroke={dailyScore >= 70 ? "#59DE9B" : dailyScore >= 50 ? "#F2CA50" : "#EF4444"}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(dailyScore / 100) * 176} 176`}
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${(dailyScore / 100) * 176} 176` }}
                  transition={{ duration: 1, delay: 0.5 }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-bold">
                {mounted ? dailyScore : "--"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex-1 hidden sm:block">
              {dailyScore >= 70 ? t("common.excellent") : dailyScore >= 50 ? t("common.balanced") : t("common.beGentle")}
            </p>
          </div>
        </motion.div>

        {/* Day Master */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{ t("dash.dayMaster") }</p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl font-serif"
              style={{ backgroundColor: `${dayMasterColor}20`, color: dayMasterColor }}>
              {sajuData.chart.dayMaster.zh}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{sajuData.chart.dayMaster.en}</p>
              <p className="text-xs text-muted-foreground">{sajuData.chart.archetype}</p>
            </div>
          </div>
        </motion.div>

        {/* Lucky Items card removed in v1.3 Sprint 2-B (chandler #4: today's-fortune section deleted) */}
      </div>

      {/* Daily Fortune Card removed in v1.3 Sprint 2-B (chandler #4: today's-fortune section deleted) */}

      {/* Four Pillars */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase">{t("dash.fourPillars")}</h2>
          {primaryReadingId && savedReadings.length > 0 && (
            <Link href={`/reading/${savedReadings.find((r) => r.id === primaryReadingId)?.share_slug || ""}`}
              className="text-sm text-primary hover:underline flex items-center gap-1">
              {t("dash.fullReading")} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {(["hour", "day", "month", "year"] as const).map((pn) => {
            const p = sajuData.chart!.pillars[pn];
            const isDay = pn === "day";
            return (
              <div key={pn} className={`bg-card/50 border rounded-lg p-2.5 sm:p-3 text-center ${isDay ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 capitalize">{pn}</p>
                <div className="text-xl sm:text-2xl font-serif" style={{ color: getElementColor(p.stem.element) }}>{p.stem.zh}</div>
                <div className="text-base sm:text-lg text-muted-foreground">{p.branch.zh}</div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Weekly */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-6 sm:mb-8">
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-3">{t("dash.thisWeek")}</h2>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((d, i) => {
            const sc = d.score >= 70 ? "#59DE9B" : d.score >= 50 ? "#F2CA50" : "#EF4444";
            return (
              <div key={i} className={`bg-card/50 border rounded-lg p-1.5 sm:p-2.5 text-center ${i === 0 ? "border-primary" : "border-border"}`}>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{d.day}</p>
                <p className="text-sm sm:text-base font-medium">{d.dateNum}</p>
                {mounted && (
                  <div className="mt-1">
                    <div className="mx-auto w-5 h-10 sm:w-6 sm:h-12 bg-muted/20 rounded-full relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700"
                        style={{ height: `${d.score}%`, backgroundColor: sc }}
                      />
                    </div>
                    <p className="text-[11px] sm:text-sm font-bold mt-0.5" style={{ color: sc }}>{d.score}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Readings */}
      {(!readingsLoaded || savedReadings.length > 0) && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> {t("dash.myReadings")}
            </h2>
            <Link href="/calculate" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t("dash.newReading")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {savedReadings.length > 1 && (
            <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> {t("dash.setPrimaryHint")}
            </p>
          )}

          {switchMessage && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`text-xs mb-2 ${switchMessage.includes("already") ? "text-amber-400/80" : "text-primary/80"}`}>
              {switchMessage}
            </motion.p>
          )}

          {!readingsLoaded ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card/50 border border-border rounded-xl p-3.5 sm:p-4 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-muted/40 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/40 rounded w-2/3" />
                    <div className="h-2 bg-muted/30 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="space-y-2">
            {(showAllReadings ? savedReadings : savedReadings.slice(0, 3)).map((r) => {
              const elColor = getElementColor(r.day_master_element);
              const isPrimary = primaryReadingId === r.id;
              return (
                <Link key={r.id} href={`/reading/${r.share_slug}`}
                  className={`bg-card/50 border rounded-xl p-3.5 sm:p-4 flex items-center gap-3 hover:border-primary/40 transition-colors ${isPrimary ? "border-primary/30" : "border-border"}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${elColor}20` }}>
                    <Sparkles className="w-5 h-5" style={{ color: elColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.name}{t("dash.possessiveReading", locale)}
                      {isPrimary && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{t("dash.myChart", locale)}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.archetype}
                      {r.is_paid && <span className="ml-2 text-primary">· {t("dash.premium", locale)}</span>}
                      <span className="ml-2">· {new Date(r.created_at).toLocaleDateString(toBCP47(locale), { month: "short", day: "numeric" })}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsMyChart(r.id); }}
                      className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${isPrimary ? "text-yellow-400" : !canChangeToday ? "text-muted-foreground/15 cursor-not-allowed" : "text-muted-foreground/30 hover:text-yellow-400/60"}`}
                      title={isPrimary ? "Primary chart" : !canChangeToday ? "Switch once per day" : "Set as my chart"}>
                      <Star className="w-4 h-4" fill={isPrimary ? "currentColor" : "none"} />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyLink(r.share_slug); }}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      title={copiedSlug === r.share_slug ? "Copied!" : "Copy link"}>
                      {copiedSlug === r.share_slug ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
                    </button>
                    <ExternalLink className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </div>
                </Link>
              );
            })}
            {savedReadings.length > 3 && !showAllReadings && (
              <button onClick={() => setShowAllReadings(true)} className="w-full py-2 text-sm text-primary hover:underline">
                {tf("dash.showAllReadings", locale, { count: savedReadings.length })}
              </button>
            )}
          </div>
          )}
        </motion.section>
      )}


      {/* Compatibility */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" /> {t("nav.compatibility")}
          </h2>
          <Link href="/compatibility" className="text-sm text-pink-400 hover:underline flex items-center gap-1">
            {t("dash.newCheck")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {compatResults.length > 0 ? (
          <div className="space-y-2">
            {compatResults.slice(0, 3).map((c) => {
              const colorA = ELEMENTS[c.person_a_element as Element]?.color || "#F2CA50";
              const colorB = ELEMENTS[c.person_b_element as Element]?.color || "#3B82F6";
              const scoreColor = c.overall_score >= 70 ? "#59DE9B" : c.overall_score >= 50 ? "#F2CA50" : "#EF4444";
              return (
                <Link key={c.id} href={`/compatibility/result/${c.share_slug}`}
                  className="bg-card/50 border border-border rounded-xl p-3.5 sm:p-4 flex items-center gap-3 hover:border-pink-500/30 transition-colors block">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${colorA}20`, color: colorA }}>
                      {c.person_a_name.charAt(0)}
                    </div>
                    <Heart className="w-3 h-3 text-pink-400" />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${colorB}20`, color: colorB }}>
                      {c.person_b_name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.person_a_name} & {c.person_b_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString(toBCP47(locale), { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color: scoreColor }}>{c.overall_score}%</p>
                  </div>
                </Link>
              );
            })}
            {compatResults.length > 3 && (
              <Link href="/compatibility" className="block w-full py-2 text-sm text-pink-400 hover:underline text-center">
                {t("dash.viewAllChecks")} {compatResults.length} {t("dash.checks")}
              </Link>
            )}
          </div>
        ) : (
          <Link href="/compatibility"
            className="block bg-card/50 border border-border rounded-xl p-5 text-center hover:border-pink-500/20 transition-colors">
            <Heart className="w-8 h-8 text-pink-400/60 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">{t("dash.checkCompat")}</p>
            <p className="text-xs text-muted-foreground">{t("dash.checkCompatDesc")}</p>
          </Link>
        )}
      </motion.section>

      <ConsultationHistory />


      {/* ════════════════════════════════════════════════════════════
          v6.3: Soram conversation history MOVED to bottom (after
          Compatibility + ConsultationHistory) per chandler's request:
          "내사주 궁합 상담내역 밑에 소람과의 대화를 배치해라".
          Same content & gating (!isNative + history.length > 0) as before,
          just relocated for the desired reading order.
      ════════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════
          v1.3 Sprint 2-B: NEW — Soram conversation backup
          Surfaces 5 most recent Q&A by default; tapping "Show more"
          expands to 10 (the limit fetched in the load effect above).
          For full history beyond 10, the "View all conversations"
          link at the top right deep-links to /soram which renders
          the entire chat scroll.

          v6 patch: hidden in native app (!isNative) — same reason
          as the top Soram CTA row. Soram is being polished; we
          surface ZERO Soram UI in the native shell during this
          window so app users don't hit a half-finished flow.
      ════════════════════════════════════════════════════════════ */}
      {!isNative && soramHistoryLoaded && soramHistory.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-300" />
              {t("dash.soramHistoryTitle", locale)}
            </h2>
            <Link
              href="/soram"
              className="text-sm text-amber-300/90 hover:text-amber-200 transition-colors flex items-center gap-1"
            >
              {t("dash.soramHistoryAll", locale)}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {(() => {
              // history arrives oldest→newest from /api (the API reverses to
              // chat-scroll order). For dashboard we want newest first, so
              // reverse once. Then slice the visible window.
              const newestFirst = soramHistory.slice().reverse();
              const visibleCount = soramHistoryExpanded ? 10 : 5;
              const visible = newestFirst.slice(0, visibleCount);
              const hasMore = newestFirst.length > visibleCount;

              return (
                <>
                  {visible.map((msg) => {
                    const dateStr = new Date(msg.createdAt).toLocaleDateString(
                      toBCP47(locale),
                      { month: "short", day: "numeric" }
                    );
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString(
                      toBCP47(locale),
                      { hour: "2-digit", minute: "2-digit" }
                    );
                    return (
                      <Link
                        key={msg.id}
                        href="/soram"
                        className="block bg-card/50 border border-amber-500/15 rounded-xl p-3.5 sm:p-4 hover:border-amber-400/35 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300/90 to-amber-500/90 flex items-center justify-center text-sm shadow-sm shrink-0">
                            <span aria-hidden="true">🌙</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-100/95 leading-snug line-clamp-1">
                              {msg.question}
                            </p>
                            <p className="text-xs text-muted-foreground/85 leading-relaxed mt-1 line-clamp-2">
                              {msg.answer}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                              {dateStr} · {timeStr}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Show-more button — appears only when there are
                      more rows to reveal. Tapping does NOT trigger a
                      network round-trip (data is already loaded). */}
                  {hasMore && !soramHistoryExpanded && (
                    <button
                      onClick={() => setSoramHistoryExpanded(true)}
                      className="w-full py-2.5 text-sm text-amber-300/90 hover:text-amber-200 transition-colors border border-amber-500/15 rounded-xl hover:border-amber-400/35"
                    >
                      {tf("dash.soramHistoryShowMore", locale, {
                        count: Math.min(newestFirst.length, 10) - 5,
                      })}
                    </button>
                  )}

                  {/* Once expanded, show a small hint that the rest
                      lives on the chat page itself. Only render when
                      the user explicitly expanded. */}
                  {soramHistoryExpanded && (
                    <Link
                      href="/soram"
                      className="block w-full py-2.5 text-sm text-center text-amber-300/90 hover:text-amber-200 transition-colors border border-amber-500/15 rounded-xl hover:border-amber-400/35"
                    >
                      {t("dash.soramHistoryAll", locale)} →
                    </Link>
                  )}
                </>
              );
            })()}
          </div>
        </motion.section>
      )}

      {/* Restore Purchases — rendered only inside the native app (Apple 4.10). */}
      <RestorePurchasesButton />

      {/* Footer — Privacy, Terms, Contact, Delete Account */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-8 mb-4 text-[11px] text-muted-foreground/50">
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
          {t("common.privacy", locale)}
        </Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">
          {t("common.terms", locale)}
        </Link>
        <span>·</span>
        <a href="mailto:info@rimfactory.io" className="hover:text-muted-foreground transition-colors">
          {t("common.contact", locale)}
        </a>
        <span>·</span>
        <button
          onClick={async () => {
            if (deleteConfirmStep === 0) {
              setDeleteConfirmStep(1);
              setTimeout(() => setDeleteConfirmStep(0), 5000);
              return;
            }
            if (deleteConfirmStep === 1) {
              setDeleteConfirmStep(2);
              try {
                let token = "";
                // Method 1: getSession()
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) token = session.access_token;
                } catch {}
                // Method 2: localStorage sb-* keys (Supabase v2 format)
                if (!token) {
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith("sb-") && k.includes("auth-token")) {
                      try { const d = JSON.parse(localStorage.getItem(k) || ""); token = d.access_token || ""; } catch {}
                    }
                  }
                }
                // Method 3: scan all localStorage for any Supabase session shape
                if (!token) {
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (!k) continue;
                    try {
                      const raw = localStorage.getItem(k) || "";
                      if (raw.includes("access_token") && raw.includes("refresh_token")) {
                        const d = JSON.parse(raw);
                        if (d.access_token && typeof d.access_token === "string" && d.access_token.length > 20) {
                          token = d.access_token;
                          break;
                        }
                      }
                    } catch {}
                  }
                }
                // Method 4: try refreshing session first, then get token
                if (!token) {
                  try {
                    const { data } = await supabase.auth.refreshSession();
                    if (data.session) token = data.session.access_token;
                  } catch {}
                }
                if (!token) { setDeleteConfirmStep(0); return; }
                const res = await fetch("/api/account/delete", {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` },
                });
                if (res.ok) { try { await signOut(); } catch {} window.location.href = isNative ? "/?app=true" : "/"; }
                else { setDeleteConfirmStep(0); }
              } catch { setDeleteConfirmStep(0); }
            }
          }}
          className={deleteConfirmStep === 1 ? "text-red-400 font-medium animate-pulse transition-colors" : deleteConfirmStep === 2 ? "text-red-400/30 pointer-events-none" : "text-red-400/50 hover:text-red-400 transition-colors"}
        >
          {deleteConfirmStep === 2
            ? t("dash.deleting", locale)
            : deleteConfirmStep === 1
            ? t("dash.tapToConfirmDelete", locale)
            : t("dash.deleteAccount", locale)}
        </button>
      </div>
      {deleteConfirmStep === 1 && (
        <p className="text-[11px] text-red-400/80 text-center mt-2 animate-in fade-in duration-200">
          {t("dash.deleteWarning", locale)}
        </p>
      )}
    </div>
  );
}
