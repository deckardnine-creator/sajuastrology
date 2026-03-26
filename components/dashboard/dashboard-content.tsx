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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ELEMENTS, calculateDailyEnergy, type Element } from "@/lib/saju-calculator";
import type { SajuChart } from "@/lib/saju-calculator";
import { reconstructChartFromReading, getElementColor } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ConsultationHistory } from "@/components/consultation/consultation-history";
import { supabase } from "@/lib/supabase-client";

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

const ELEMENT_GUIDANCE: Record<string, { high: string; mid: string; low: string }> = {
  wood: {
    high: "Your Wood energy flows freely today — creative ideas come naturally. Act on them before the day ends.",
    mid: "Steady growth energy today. Focus on nurturing existing projects rather than starting new ones.",
    low: "Your Wood element feels constrained. Spend time outdoors or around plants to restore your rhythm.",
  },
  fire: {
    high: "Your Fire burns bright today — charisma and influence peak. Great for presentations and bold moves.",
    mid: "Warm, stable energy today. Good for deepening relationships and completing creative work.",
    low: "Your Fire is banked low. Avoid confrontation. Recharge through warmth — hot tea, gentle movement.",
  },
  earth: {
    high: "Your Earth energy is solid — trust your practical instincts. Major decisions are well-supported today.",
    mid: "Grounded energy today. Ideal for organization, planning, and building foundations.",
    low: "Your Earth feels scattered. Focus on one task at a time. Eat nourishing food and stay grounded.",
  },
  metal: {
    high: "Your Metal is sharp today — clarity and precision peak. Excellent for analysis and decisive action.",
    mid: "Balanced Metal energy. Good for refining plans and cutting away what no longer serves you.",
    low: "Your Metal energy dims today. Avoid major financial decisions. Focus on rest and breathing.",
  },
  water: {
    high: "Your Water flows powerfully — intuition and wisdom surge. Trust the insights in quiet moments.",
    mid: "Gentle, reflective energy today. Good for learning, reading, and meaningful conversations.",
    low: "Your Water feels stagnant. Drink plenty of water, take a shower, and let your mind wander freely.",
  },
};

function getDailyGuidance(element: string, score: number): string {
  const g = ELEMENT_GUIDANCE[element] || ELEMENT_GUIDANCE.water;
  if (score >= 75) return g.high;
  if (score >= 55) return g.mid;
  return g.low;
}

export function DashboardContent() {
  const { user, sajuData, saveSajuChart } = useAuth();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [primaryReadingId, setPrimaryReadingId] = useState<string | null>(null);
  const [canChangeToday, setCanChangeToday] = useState(true);
  const [switchMessage, setSwitchMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // User's local date (timezone-aware)
  const todayLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());

  useEffect(() => {
    setMounted(true);
    const savedPrimary = localStorage.getItem("primary-reading-id");
    if (savedPrimary) setPrimaryReadingId(savedPrimary);
    const lastChanged = localStorage.getItem("primary-changed-date");
    if (lastChanged === todayLocal) setCanChangeToday(false);
  }, [todayLocal]);

  useEffect(() => {
    if (sajuData.chart) {
      setDailyScore(calculateDailyEnergy(sajuData.chart, new Date()));
    }
  }, [sajuData.chart]);

  // Fetch readings + auto-select primary
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("readings")
        .select("id,name,gender,birth_date,birth_city,share_slug,archetype,ten_god,harmony_score,day_master_element,day_master_yinyang,dominant_element,weakest_element,year_stem,year_branch,month_stem,month_branch,day_stem,day_branch,hour_stem,hour_branch,elements_wood,elements_fire,elements_earth,elements_metal,elements_water,is_paid,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const readings = data || [];
      setSavedReadings(readings);

      const currentPrimary = localStorage.getItem("primary-reading-id");
      if (readings.length > 0) {
        const primaryExists = readings.some((r) => r.id === currentPrimary);
        if (!currentPrimary || !primaryExists) {
          const defaultReading = readings[0];
          setPrimaryReadingId(defaultReading.id);
          localStorage.setItem("primary-reading-id", defaultReading.id);
          if (!sajuData.chart) {
            saveSajuChart(reconstructChartFromReading(defaultReading) as SajuChart);
          }
        }
      }
    })();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAsMyChart = (readingId: string) => {
    if (primaryReadingId === readingId) return;
    if (!canChangeToday) {
      setSwitchMessage("You already switched today. Try again tomorrow.");
      setTimeout(() => setSwitchMessage(""), 3000);
      return;
    }
    const r = savedReadings.find((rd) => rd.id === readingId);
    if (!r) return;

    const reconstructed = reconstructChartFromReading(r);
    saveSajuChart(reconstructed as SajuChart);
    setPrimaryReadingId(readingId);
    setCanChangeToday(false);
    localStorage.setItem("primary-reading-id", readingId);
    localStorage.setItem("primary-changed-date", todayLocal);
    setDailyScore(calculateDailyEnergy(reconstructed as SajuChart, new Date()));
    setSwitchMessage(`Switched to ${r.name}'s chart!`);
    setTimeout(() => setSwitchMessage(""), 2500);
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/reading/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const score = sajuData.chart ? Math.round(calculateDailyEnergy(sajuData.chart, d)) : 0;
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), dateNum: d.getDate(), score };
    });
  }, [sajuData.chart]);

  // Empty state
  if (!sajuData.chart) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl sm:text-3xl font-serif text-primary mb-4">Welcome, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm sm:text-base">
            Your cosmic blueprint awaits. Generate your Saju reading to unlock personalized daily insights.
          </p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground h-12 px-6">
              <Sparkles className="w-4 h-4 mr-2" /> Generate My Reading
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const dayMasterElement = (sajuData.chart.dayMaster.element || "water") as Element;
  const dayMasterColor = ELEMENTS[dayMasterElement]?.color || "#F2CA50";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground">
          Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </motion.div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Today&apos;s Energy</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                <motion.circle cx="32" cy="32" r="28" fill="none"
                  stroke={dailyScore >= 70 ? "#59DE9B" : dailyScore >= 50 ? "#F2CA50" : "#EF4444"}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(dailyScore / 100) * 176} 176`}
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${(dailyScore / 100) * 176} 176` }}
                  transition={{ duration: 1, delay: 0.5 }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {mounted ? dailyScore : "--"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              {dailyScore >= 70 ? "Excellent alignment" : dailyScore >= 50 ? "Balanced forces" : "Navigate carefully"}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your Day Master</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-serif"
              style={{ backgroundColor: `${dayMasterColor}20`, color: dayMasterColor }}>
              {sajuData.chart.dayMaster.zh}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{sajuData.chart.dayMaster.en}</p>
              <p className="text-xs text-muted-foreground capitalize">{dayMasterElement} element</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{sajuData.chart.archetype}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 sm:p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Today&apos;s Guidance</p>
          <p className="text-sm text-foreground leading-relaxed">{getDailyGuidance(dayMasterElement, dailyScore)}</p>
        </motion.div>
      </div>

      {/* Four Pillars */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase">Your Four Pillars</h2>
          {primaryReadingId && savedReadings.length > 0 && (
            <Link href={`/reading/${savedReadings.find((r) => r.id === primaryReadingId)?.share_slug || ""}`}
              className="text-sm text-primary hover:underline flex items-center gap-1">
              View Full Reading <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {(["hour", "day", "month", "year"] as const).map((pn) => {
            const p = sajuData.chart!.pillars[pn];
            const isDay = pn === "day";
            return (
              <div key={pn} className={`bg-card/50 backdrop-blur border rounded-lg p-2.5 sm:p-3 text-center ${isDay ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
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
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-3">This Week</h2>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((d, i) => {
            const sc = d.score >= 70 ? "#59DE9B" : d.score >= 50 ? "#F2CA50" : "#EF4444";
            return (
              <div key={i} className={`bg-card/50 border rounded-lg p-1.5 sm:p-2.5 text-center ${i === 0 ? "border-primary" : "border-border"}`}>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{d.day}</p>
                <p className="text-sm sm:text-base font-medium">{d.dateNum}</p>
                {mounted && <p className="text-[11px] sm:text-sm font-bold mt-0.5" style={{ color: sc }}>{d.score}</p>}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Readings */}
      {savedReadings.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> My Readings
            </h2>
            <Link href="/calculate" className="text-sm text-primary hover:underline flex items-center gap-1">
              New Reading <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {savedReadings.length > 1 && (
            <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Tap ★ to set your primary chart (once per day). It powers your daily scores.
            </p>
          )}

          {switchMessage && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`text-xs mb-2 ${switchMessage.includes("already") ? "text-amber-400/80" : "text-primary/80"}`}>
              {switchMessage}
            </motion.p>
          )}

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
                      {r.name}&apos;s Reading
                      {isPrimary && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">MY CHART</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.archetype}
                      {r.is_paid && <span className="ml-2 text-primary">· Premium</span>}
                      <span className="ml-2">· {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
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
                Show all {savedReadings.length} readings
              </button>
            )}
          </div>
        </motion.section>
      )}

      <ConsultationHistory />
    </div>
  );
}
