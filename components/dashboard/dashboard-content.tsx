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
  Compass,
  Palette,
  Zap,
  Heart,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useNativeApp } from "@/lib/native-app";
import { ELEMENTS, calculateDailyEnergy, type Element } from "@/lib/saju-calculator";
import type { SajuChart } from "@/lib/saju-calculator";
import { reconstructChartFromReading, getElementColor } from "@/lib/constants";
import type { DailyFortune } from "@/lib/daily-fortune";
import { Button } from "@/components/ui/button";
import { ConsultationHistory } from "@/components/consultation/consultation-history";
import { safeGet, safeSet, safeRemove } from "@/lib/safe-storage";

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

const READING_COLS = "id,name,gender,birth_date,birth_city,share_slug,archetype,ten_god,harmony_score,day_master_element,day_master_yinyang,dominant_element,weakest_element,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,is_paid,created_at";

export function DashboardContent() {
  const { user, sajuData, saveSajuChart, claimTrigger, signOut } = useAuth();
  const { t, locale } = useLanguage();
  const isNative = useNativeApp();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [readingsLoaded, setReadingsLoaded] = useState(false);
  const [primaryReadingId, setPrimaryReadingId] = useState<string | null>(null);
  const [canChangeToday, setCanChangeToday] = useState(true);
  const [switchMessage, setSwitchMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [fortuneCopied, setFortuneCopied] = useState(false);
  const [compatResults, setCompatResults] = useState<CompatResult[]>([]);

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
      setSwitchMessage(locale === "ko" ? "오늘 이미 변경했어요. 내일 다시 시도하세요." : locale === "ja" ? "今日はすでに変更しました。明日もう一度お試しください。" : "You already switched today. Try again tomorrow.");
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

  const dateLocale = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
  const formattedDate = new Date().toLocaleDateString(dateLocale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const score = sajuData.chart ? Math.round(calculateDailyEnergy(sajuData.chart, d)) : 0;
      const wLocale = locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US";
      return { day: d.toLocaleDateString(wLocale, { weekday: "short" }), dateNum: d.getDate(), score };
    });
  }, [sajuData.chart]);

  // Daily fortune — lazy loaded (52KB saved from initial bundle)
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  useEffect(() => {
    if (!sajuData.chart) return;
    const el = sajuData.chart.dayMaster.element;
    // Load locale-specific fortune data with proper async IIFE
    (async () => {
      try {
        const [baseMod, koMod, jaMod] = await Promise.all([
          import("@/lib/daily-fortune"),
          import("@/lib/daily-fortune-ko").catch(() => null),
          import("@/lib/daily-fortune-ja").catch(() => null),
        ]);
        setFortune(baseMod.getDailyFortuneLocale(
          el,
          dailyScore,
          locale,
          (koMod as any)?.FORTUNES_KO,
          (jaMod as any)?.FORTUNES_JA,
        ));
      } catch {
        // Fallback to English fortune on error
        import("@/lib/daily-fortune").then(mod => {
          setFortune(mod.getDailyFortune(el, dailyScore));
        }).catch(() => {});
      }
    })();
  }, [sajuData.chart, dailyScore, locale]);

  const handleShareFortune = () => {
    if (!fortune) return;
    const siteTag = locale === "ko" ? "나의 오늘의 사주 운세 — sajuastrology.com" : locale === "ja" ? "今日の四柱推命運勢 — sajuastrology.com" : "My Saju Daily Fortune — sajuastrology.com";
    const text = `${fortune.shareText}\n\n${siteTag}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setFortuneCopied(true);
      setTimeout(() => setFortuneCopied(false), 2000);
    }
  };

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
      <div className="max-w-4xl mx-auto text-center min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-serif text-primary mb-4">{t("dash.welcome")} {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm sm:text-base">
            {t("dash.emptyDesc")}
          </p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground h-12 px-6">
              <Sparkles className="w-4 h-4 mr-2" /> {t("dash.generateReading")}
            </Button>
          </Link>
        </motion.div>
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

        {/* Lucky Items — desktop only as 3rd card */}
        {fortune && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5 hidden md:block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t("dash.todayLucky")}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: fortune.luckyColorHex }} />
                <span className="text-sm text-foreground">{fortune.luckyColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{fortune.luckyDirection}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground truncate">{fortune.luckyActivity}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Daily Fortune Card — the main engagement driver */}
      {fortune && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mb-6 sm:mb-8">
          <div className="bg-card/50 backdrop-blur border border-primary/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("dash.todayFortune")}</p>
              <button
                onClick={handleShareFortune}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0 min-h-[32px]"
              >
                {fortuneCopied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                {fortuneCopied ? (locale === "ko" ? "복사됨!" : locale === "ja" ? "コピー済み!" : "Copied!") : (locale === "ko" ? "공유" : locale === "ja" ? "共有" : "Share")}
              </button>
            </div>
            <p className="text-sm sm:text-base text-foreground leading-relaxed mb-3">{fortune.message}</p>
            <p className="text-sm text-primary font-medium mb-3">{fortune.advice}</p>

            {/* Lucky items — mobile (shows inline since 3rd card is hidden) */}
            <div className="flex flex-wrap gap-3 md:hidden text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: fortune.luckyColorHex }} />
                {fortune.luckyColor}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> {fortune.luckyDirection}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> {fortune.luckyActivity}
              </span>
            </div>
          </div>
        </motion.div>
      )}

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
                      {r.name}{locale === "ko" ? "의 사주" : locale === "ja" ? "の四柱" : "'s Reading"}
                      {isPrimary && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{locale === "ko" ? "내 사주" : locale === "ja" ? "マイチャート" : "MY CHART"}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.archetype}
                      {r.is_paid && <span className="ml-2 text-primary">· {locale === "ko" ? "프리미엄" : locale === "ja" ? "プレミアム" : "Premium"}</span>}
                      <span className="ml-2">· {new Date(r.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", { month: "short", day: "numeric" })}</span>
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
                {locale === "ko" ? `전체 ${savedReadings.length}개 보기` : locale === "ja" ? `全${savedReadings.length}件を表示` : `Show all ${savedReadings.length} readings`}
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
                      {new Date(c.created_at).toLocaleDateString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", { month: "short", day: "numeric" })}
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
    </div>
  );
}
