"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Calendar,
  MessageCircle,
  Share2,
  UserPlus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ELEMENTS, calculateDailyEnergy, type Element } from "@/lib/saju-calculator";
import { Button } from "@/components/ui/button";

export function DashboardContent() {
  const { user, sajuData } = useAuth();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sajuData.chart) {
      const score = calculateDailyEnergy(sajuData.chart, new Date());
      setDailyScore(score);
    }
  }, [sajuData.chart]);

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

  const dayMasterElement = sajuData.chart.dayMaster.element as Element;
  const dayMasterColor = ELEMENTS[dayMasterElement].color;

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

        {/* Lucky Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur border border-border rounded-xl p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Lucky Elements Today
          </p>
          <div className="flex gap-3">
            {["water", "wood"].map((el) => (
              <div
                key={el}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: `${ELEMENTS[el as Element].color}20`,
                  color: ELEMENTS[el as Element].color,
                }}
              >
                {el.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Water supports your day master
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
            Quick Guidance
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            Morning hours favor creative work. Afternoon brings opportunities for connection
            and collaboration.
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
            href="/reading"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View Full Reading <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(["hour", "day", "month", "year"] as const).map((pillarName) => {
            const pillar = sajuData.chart!.pillars[pillarName];
            const isDay = pillarName === "day";
            const stemColor = ELEMENTS[pillar.stem.element as Element].color;

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

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Recent Activity
        </h2>
        <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Your reading generated:{" "}
              {sajuData.readingGeneratedAt?.toLocaleDateString() || "Recently"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">
              Archetype identified: <span className="text-foreground">{sajuData.chart.archetype}</span>
            </span>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-3 text-sm text-primary hover:underline"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Next: Unlock your 10-year Wealth Path forecast</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            href="/compatibility"
            icon={<Calendar className="w-5 h-5" />}
            label="Check Compatibility"
          />
          <QuickAction
            href="/oracle"
            icon={<MessageCircle className="w-5 h-5" />}
            label="Ask the Oracle"
          />
          <QuickAction
            href="/share"
            icon={<Share2 className="w-5 h-5" />}
            label="Share My Archetype"
          />
          <QuickAction
            href="#invite"
            icon={<UserPlus className="w-5 h-5" />}
            label="Invite a Friend"
          />
        </div>
      </motion.section>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-card/50 backdrop-blur border border-border rounded-xl hover:border-primary/50 transition-colors"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </Link>
  );
}
