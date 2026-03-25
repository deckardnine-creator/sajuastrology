"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Crown,
  FileText,
  ExternalLink,
  Share2,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ELEMENTS, calculateDailyEnergy, type Element } from "@/lib/saju-calculator";
import { Button } from "@/components/ui/button";
import { ConsultationHistory } from "@/components/consultation/consultation-history";
import { supabase } from "@/lib/supabase-client";

interface SavedReading {
  id: string;
  name: string;
  share_slug: string;
  archetype: string;
  day_master_element: string;
  is_paid: boolean;
  created_at: string;
}

export function DashboardContent() {
  const { user, sajuData, saveSajuChart } = useAuth();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [primaryReadingId, setPrimaryReadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load primary reading preference
    const savedPrimary = localStorage.getItem("primary-reading-id");
    if (savedPrimary) setPrimaryReadingId(savedPrimary);

    if (sajuData.chart) {
      const score = calculateDailyEnergy(sajuData.chart, new Date());
      setDailyScore(score);
    }
  }, [sajuData.chart]);

  // Fetch user's saved readings from Supabase
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("readings")
        .select("id, name, share_slug, archetype, day_master_element, is_paid, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setSavedReadings(data || []);
    })();
  }, [user]);

  const DAY_MASTER_ZH: Record<string, string> = {
    "wood-yang": "甲", "wood-yin": "乙", "fire-yang": "丙", "fire-yin": "丁",
    "earth-yang": "戊", "earth-yin": "己", "metal-yang": "庚", "metal-yin": "辛",
    "water-yang": "壬", "water-yin": "癸",
  };

  const setAsMyChart = async (readingId: string) => {
    // Fetch full reading data
    const { data } = await supabase
      .from("readings")
      .select("*")
      .eq("id", readingId)
      .single();
    if (!data) return;

    const r = data;
    const dmKey = `${r.day_master_element}-${r.day_master_yinyang}`;
    const reconstructed = {
      name: r.name,
      gender: r.gender as "male" | "female",
      birthDate: new Date(r.birth_date),
      birthCity: r.birth_city,
      dayMaster: {
        zh: DAY_MASTER_ZH[dmKey] || "?",
        en: `${r.day_master_yinyang === "yang" ? "Yang" : "Yin"} ${r.day_master_element.charAt(0).toUpperCase() + r.day_master_element.slice(1)}`,
        element: r.day_master_element,
        yinYang: r.day_master_yinyang,
      },
      pillars: {
        year:  { stem: { zh: r.year_stem,  en: "", element: "" }, branch: { zh: r.year_branch,  en: "", element: "" } },
        month: { stem: { zh: r.month_stem, en: "", element: "" }, branch: { zh: r.month_branch, en: "", element: "" } },
        day:   { stem: { zh: r.day_stem,   en: "", element: "" }, branch: { zh: r.day_branch,   en: "", element: "" } },
        hour:  { stem: { zh: r.hour_stem,  en: "", element: "" }, branch: { zh: r.hour_branch,  en: "", element: "" } },
      },
      archetype: r.archetype,
      tenGod: r.ten_god,
      harmonyScore: r.harmony_score,
      dominantElement: r.dominant_element,
      weakestElement: r.weakest_element,
      elements: { wood: r.elements_wood, fire: r.elements_fire, earth: r.elements_earth, metal: r.elements_metal, water: r.elements_water },
      elementBalance: { wood: r.elements_wood, fire: r.elements_fire, earth: r.elements_earth, metal: r.elements_metal, water: r.elements_water },
    } as any;

    saveSajuChart(reconstructed);
    setPrimaryReadingId(readingId);
    localStorage.setItem("primary-reading-id", readingId);
    // Immediately recalculate energy score
    const newScore = calculateDailyEnergy(reconstructed, new Date());
    setDailyScore(newScore);
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate mock weekly data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const score = sajuData.chart
      ? calculateDailyEnergy(sajuData.chart, date)
      : 60 + Math.random() * 30;
    return {
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: date.getDate(),
      score: Math.round(score),
    };
  });

  if (!sajuData.chart) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-serif text-primary mb-4">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your cosmic blueprint awaits. Generate your Saju reading to unlock
            personalized daily insights and guidance.
          </p>
          <Link href="/calculate">
            <Button className="gold-gradient text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Reading
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
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-serif text-foreground">
          Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </motion.div>

      {/* Today's Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Energy Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Today&apos;s Energy Score
          </p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={dailyScore >= 70 ? "#59DE9B" : dailyScore >= 50 ? "#F2CA50" : "#EF4444"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(dailyScore / 100) * 176} 176`}
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${(dailyScore / 100) * 176} 176` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {mounted ? dailyScore : "--"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              {dailyScore >= 70
                ? "Excellent energy alignment today"
                : dailyScore >= 50
                ? "Balanced cosmic forces"
                : "Navigate with awareness"}
            </p>
          </div>
        </motion.div>

        {/* Favorable Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Your Day Master
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-serif"
              style={{
                backgroundColor: `${dayMasterColor}20`,
                color: dayMasterColor,
              }}
            >
              {sajuData.chart.dayMaster.zh}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{sajuData.chart.dayMaster.en}</p>
              <p className="text-xs text-muted-foreground capitalize">{dayMasterElement} element</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {sajuData.chart.archetype}
          </p>
        </motion.div>

        {/* Quick Guidance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Today&apos;s Guidance
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            {dailyScore >= 75
              ? "Strong cosmic alignment today. Trust your instincts and take action on important decisions."
              : dailyScore >= 60
              ? "Balanced energy today. Good for steady progress — focus on relationships and collaboration."
              : dailyScore >= 45
              ? "Mixed energies today. Take time for reflection before making major commitments."
              : "Gentle day ahead. Rest, recharge, and plan rather than push forward."}
          </p>
        </motion.div>
      </div>

      {/* Four Pillars Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm tracking-wider text-muted-foreground uppercase">
            Your Four Pillars
          </h2>
          <Link
            href="/calculate"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View Full Reading <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(["hour", "day", "month", "year"] as const).map((pillarName) => {
            const pillar = sajuData.chart!.pillars[pillarName];
            const isDay = pillarName === "day";
            const stemColor = ELEMENTS[pillar.stem.element as Element]?.color || dayMasterColor;

            return (
              <div
                key={pillarName}
                className={`bg-card/50 backdrop-blur border rounded-lg p-3 text-center ${
                  isDay ? "border-primary ring-1 ring-primary/20" : "border-border"
                }`}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 capitalize">
                  {pillarName}
                </p>
                <div className="text-2xl font-serif" style={{ color: stemColor }}>
                  {pillar.stem.zh}
                </div>
                <div className="text-lg text-muted-foreground">{pillar.branch.zh}</div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ★ My Saved Readings ★ */}
      {savedReadings.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              My Readings
            </h2>
            <Link href="/calculate" className="text-sm text-primary hover:underline flex items-center gap-1">
              New Reading <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!primaryReadingId && savedReadings.length > 0 && (
            <p className="text-xs text-amber-400/80 mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Tap the star to set which reading is yours — it&apos;ll be used for your daily energy score.
            </p>
          )}
          <div className="space-y-2">
            {(showAllReadings ? savedReadings : savedReadings.slice(0, 3)).map((r) => {
              const elColor = ELEMENTS[(r.day_master_element as Element) || "water"]?.color || "#6B7280";
              return (
                <Link key={r.id} href={`/reading/${r.share_slug}`}
                  className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${elColor}20` }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: elColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.name}&apos;s Reading
                      {primaryReadingId === r.id && (
                        <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">MY CHART</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.archetype}
                      {r.is_paid && <span className="ml-2 text-primary">· Premium</span>}
                      <span className="ml-2">
                        · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAsMyChart(r.id);
                      }}
                      className={`p-2 transition-colors ${primaryReadingId === r.id ? "text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400/60"}`}
                      title={primaryReadingId === r.id ? "This is your chart" : "Set as my chart"}
                    >
                      <Star className="w-4 h-4" fill={primaryReadingId === r.id ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/reading/${r.share_slug}`);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
            {savedReadings.length > 3 && !showAllReadings && (
              <button
                onClick={() => setShowAllReadings(true)}
                className="w-full py-2 text-sm text-primary hover:underline"
              >
                Show all {savedReadings.length} readings
              </button>
            )}
          </div>
        </motion.section>
      )}

      {/* ★ My Consultations ★ */}
      <ConsultationHistory />

      {/* Weekly Outlook */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          This Week&apos;s Outlook
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((day, i) => {
            const isToday = i === 0;
            const scoreColor =
              day.score >= 70 ? "#59DE9B" : day.score >= 50 ? "#F2CA50" : "#EF4444";

            return (
              <div
                key={i}
                className={`flex-shrink-0 w-16 bg-card/50 backdrop-blur border rounded-lg p-3 text-center ${
                  isToday ? "border-primary" : "border-border"
                }`}
              >
                <p className="text-xs text-muted-foreground">{day.day}</p>
                <p className="text-lg font-medium">{day.dateNum}</p>
                <div
                  className="w-3 h-3 rounded-full mx-auto mt-2"
                  style={{ backgroundColor: scoreColor }}
                />
              </div>
            );
          })}
        </div>
      </motion.section>

    </div>
  );
}
