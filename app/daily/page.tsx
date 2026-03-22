"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Share2, Sparkles, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { Button } from "@/components/ui/button";
import { calculateDailyEnergy, getDailyPillar, ELEMENTS, type Element, type SajuChart } from "@/lib/saju-calculator";
import { EmailCapture } from "@/components/daily/email-capture";

export default function DailyEnergyPage() {
  const { sajuData, isLoading } = useAuth();
  const [dailyScore, setDailyScore] = useState(72);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sajuData.chart) {
      const score = calculateDailyEnergy(sajuData.chart, new Date());
      setDailyScore(score);
    }
  }, [sajuData.chart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const dailyPillar = getDailyPillar(today);
  const dailyElement = dailyPillar.stem.element as Element;

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          {sajuData.chart ? (
            <DailyContent
              formattedDate={formattedDate}
              dailyPillar={dailyPillar}
              dailyElement={dailyElement}
              dailyScore={mounted ? dailyScore : 0}
              chart={sajuData.chart}
            />
          ) : (
            <NoChartContent />
          )}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20 p-4">
          {sajuData.chart ? (
            <DailyContent
              formattedDate={formattedDate}
              dailyPillar={dailyPillar}
              dailyElement={dailyElement}
              dailyScore={mounted ? dailyScore : 0}
              chart={sajuData.chart}
            />
          ) : (
            <NoChartContent />
          )}
        </main>
        <MobileDashboardNav />
      </div>
    </div>
  );
}

function NoChartContent() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-serif text-primary mb-4">
          Unlock Your Daily Energy
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Generate your Saju reading first to receive personalized daily insights
          based on your unique cosmic blueprint.
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

function DailyContent({
  formattedDate,
  dailyPillar,
  dailyElement,
  dailyScore,
  chart,
}: {
  formattedDate: string;
  dailyPillar: ReturnType<typeof getDailyPillar>;
  dailyElement: Element;
  dailyScore: number;
  chart: SajuChart;
}) {
  const userElement = chart.dayMaster.element as Element;
  
  // Generate guidance based on element relationships with varied scores
  const getGuidance = () => {
    const relationship = getElementRelationship(userElement, dailyElement);
    // Creation relationship = 75-90, same element = 60-75, destruction = 40-55, neutral = 55-70
    const wealthScore = relationship === "supported" ? 85 : relationship === "controlling" ? 90 :
                        relationship === "challenged" ? 45 : relationship === "same" ? 70 : 60;
    const loveScore = relationship === "supported" ? 90 : relationship === "challenged" ? 50 :
                      relationship === "same" ? 75 : relationship === "controlling" ? 65 : 60;
    const careerScore = relationship === "controlling" ? 88 : relationship === "supported" ? 85 :
                        relationship === "challenged" ? 48 : relationship === "same" ? 72 : 62;
    
    return {
      wealth: { 
        status: wealthScore >= 80 ? "Strong" : wealthScore >= 60 ? "Moderate" : "Caution",
        desc: wealthScore >= 80 ? "Favorable for investments" : wealthScore >= 60 ? "Maintain current positions" : "Avoid major financial decisions",
        score: wealthScore
      },
      love: { 
        status: loveScore >= 80 ? "Peak" : loveScore >= 60 ? "Steady" : "Caution",
        desc: loveScore >= 80 ? "Express your feelings openly" : loveScore >= 60 ? "Steady connections today" : "Avoid confrontation",
        score: loveScore
      },
      career: { 
        status: careerScore >= 80 ? "Strong" : careerScore >= 60 ? "Moderate" : "Caution",
        desc: careerScore >= 80 ? "Take initiative on projects" : careerScore >= 60 ? "Focus on routine tasks" : "Lay low and observe",
        score: careerScore
      },
    };
  };

  const guidance = getGuidance();
  
  // Generate oracle insight
  const getOracleInsight = () => {
    const relationship = getElementRelationship(userElement, dailyElement);
    if (relationship === "supported") {
      return `Today's ${dailyElement} energy nourishes your ${userElement} Day Master, creating optimal conditions for growth and expression. Your natural talents are amplified, making this an excellent day for creative endeavors and personal development. Trust your instincts and move forward with confidence.`;
    } else if (relationship === "controlling") {
      return `Your ${userElement} Day Master harmonizes with today's ${dailyElement} energy, granting you natural authority and influence. This is a powerful day for leadership, decision-making, and asserting your vision. Others will respond positively to your direction.`;
    } else if (relationship === "challenged") {
      return `Today's ${dailyElement} energy challenges your ${userElement} Day Master, requiring mindful navigation. This isn't necessarily negative—tension can catalyze growth. Focus on flexibility and avoid forcing outcomes. Evening hours bring relief.`;
    }
    return `Today's ${dailyElement} energy creates a neutral backdrop for your ${userElement} Day Master. This is a day for steady progress rather than dramatic moves. Focus on consistency and building upon existing foundations.`;
  };

  // Generate weekly outlook
  const getWeeklyOutlook = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const pillar = getDailyPillar(date);
      const element = pillar.stem.element as Element;
      const score = calculateDailyEnergy(chart, date);
      const relationship = getElementRelationship(userElement, element);
      
      const theme = getDayTheme(userElement, element);
      days.push({
        date,
        dateStr: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        element,
        score: Math.round(score),
        title: theme.title,
        tag: theme.tag,
        forecast: theme.desc,
      });
    }
    return days;
  };

  const weeklyOutlook = getWeeklyOutlook();

  // Traditional Chinese hours
  const chineseHours = [
    { zh: "子時", en: "Zi", time: "23-01", element: "water" },
    { zh: "丑時", en: "Chou", time: "01-03", element: "earth" },
    { zh: "寅時", en: "Yin", time: "03-05", element: "wood" },
    { zh: "卯時", en: "Mao", time: "05-07", element: "wood" },
    { zh: "辰時", en: "Chen", time: "07-09", element: "earth" },
    { zh: "巳時", en: "Si", time: "09-11", element: "fire" },
    { zh: "午時", en: "Wu", time: "11-13", element: "fire" },
    { zh: "未時", en: "Wei", time: "13-15", element: "earth" },
    { zh: "申時", en: "Shen", time: "15-17", element: "metal" },
    { zh: "酉時", en: "You", time: "17-19", element: "metal" },
    { zh: "戌時", en: "Xu", time: "19-21", element: "earth" },
    { zh: "亥時", en: "Hai", time: "21-23", element: "water" },
  ];

  const currentHour = new Date().getHours();
  const getCurrentHourIndex = () => {
    if (currentHour >= 23 || currentHour < 1) return 0;
    if (currentHour < 3) return 1;
    if (currentHour < 5) return 2;
    if (currentHour < 7) return 3;
    if (currentHour < 9) return 4;
    if (currentHour < 11) return 5;
    if (currentHour < 13) return 6;
    if (currentHour < 15) return 7;
    if (currentHour < 17) return 8;
    if (currentHour < 19) return 9;
    if (currentHour < 21) return 10;
    return 11;
  };

  const luckyColor = ELEMENTS[ELEMENTS[userElement].produces as Element].color;
  const luckyDirection = getDirection(userElement);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-foreground">Daily Energy</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground text-sm">{formattedDate}</p>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ELEMENTS[dailyElement].color }}
                />
                <span className="text-xs" style={{ color: ELEMENTS[dailyElement].color }}>
                  {dailyPillar.stem.en} Day
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </motion.div>

      {/* Daily Destiny Score */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Score Gauge */}
            <div className="relative">
              <svg className="w-40 h-40 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={dailyScore >= 70 ? "#59DE9B" : dailyScore >= 50 ? "#F2CA50" : "#EF4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(dailyScore / 100) * 440} 440`}
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{ strokeDasharray: `${(dailyScore / 100) * 440} 440` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {dailyScore}
                </motion.span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Harmonic Index
                </span>
              </div>
            </div>

            {/* Element Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: `${ELEMENTS[dailyElement].color}20`,
                    color: ELEMENTS[dailyElement].color,
                  }}
                >
                  {dailyElement.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dominant Element</p>
                  <p className="text-lg font-semibold capitalize">{dailyElement}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {dailyScore >= 70
                  ? "Excellent cosmic alignment today. Your energy flows harmoniously with universal forces."
                  : dailyScore >= 50
                  ? "Balanced energies today. Navigate with awareness and intention."
                  : "Challenging alignments require mindful navigation. Focus on inner stability."}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Oracle Insight */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg text-primary">Oracle Insight</h2>
          </div>
          <p className="text-foreground leading-relaxed mb-4">
            {getOracleInsight()}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Confidence Score: {Math.round(85 + Math.random() * 10)}%
            </span>
            <Link href="/oracle" className="text-sm text-primary hover:underline">
              Full Reading →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Today's Guidance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Today&apos;s Guidance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💰", label: "Wealth", ...guidance.wealth },
            { icon: "❤️", label: "Love", ...guidance.love },
            { icon: "💼", label: "Career", ...guidance.career },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card/50 backdrop-blur border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === "Peak" || item.status === "Strong"
                      ? "bg-accent/20 text-accent"
                      : item.status === "Caution"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Hourly Energy Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Hourly Energy Timeline
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {chineseHours.map((hour, i) => {
              const isCurrentHour = i === getCurrentHourIndex();
              const hourElement = hour.element as Element;
              const hourScore = getElementRelationship(userElement, hourElement) === "supported" ? 80 :
                               getElementRelationship(userElement, hourElement) === "controlling" ? 75 :
                               getElementRelationship(userElement, hourElement) === "challenged" ? 45 : 60;

              return (
                <div
                  key={hour.zh}
                  className={`flex-shrink-0 w-20 bg-card/50 backdrop-blur border rounded-lg p-3 text-center transition-all ${
                    isCurrentHour ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  <p className="text-lg font-serif" style={{ color: ELEMENTS[hourElement].color }}>
                    {hour.zh}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{hour.time}</p>
                  <div
                    className="w-2 h-2 rounded-full mx-auto mt-2"
                    style={{
                      backgroundColor: hourScore >= 70 ? "#59DE9B" : hourScore >= 50 ? "#F2CA50" : "#EF4444",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Scroll to see all 12 traditional Chinese hours (時辰)
        </p>
      </motion.section>

      {/* Weekly Outlook */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Weekly Outlook
        </h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {weeklyOutlook.map((day, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-64 bg-card/50 backdrop-blur border rounded-xl p-4 ${
                  i === 0 ? "border-primary" : "border-border"
                }`}
                style={{ borderLeftColor: ELEMENTS[day.element].color, borderLeftWidth: "3px" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{day.dateStr}</span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: ELEMENTS[day.element].color }}
                  />
                </div>
                <h3 className="font-serif text-lg mb-2">{day.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{day.forecast}</p>
                <span
                  className="text-[10px] px-2 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: `${ELEMENTS[day.element].color}20`,
                    color: ELEMENTS[day.element].color,
                  }}
                >
                  {day.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Five Elements Weather */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-sm tracking-wider text-muted-foreground uppercase mb-4">
          Five Elements Weather
        </h2>
        <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-6">
          <div className="flex justify-between items-end mb-4">
            {(["wood", "fire", "earth", "metal", "water"] as Element[]).map((el) => {
              const strength = el === dailyElement ? 4 : el === ELEMENTS[dailyElement].produces ? 3 : 
                              el === ELEMENTS[dailyElement].controls ? 1 : 2;
              return (
                <div key={el} className="flex flex-col items-center gap-2">
                  <div className="flex flex-col-reverse gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`w-8 h-3 rounded-sm transition-all ${
                          level <= strength ? "" : "opacity-20"
                        }`}
                        style={{ backgroundColor: ELEMENTS[el].color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs capitalize">{el}</span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Today&apos;s dominant force:{" "}
            <span style={{ color: ELEMENTS[dailyElement].color }} className="font-medium capitalize">
              {dailyElement}
            </span>
            {" "}— {dailyElement === "fire" ? "a day for bold action and visibility" :
                   dailyElement === "water" ? "a day for reflection and wisdom" :
                   dailyElement === "wood" ? "a day for growth and new beginnings" :
                   dailyElement === "metal" ? "a day for precision and organization" :
                   "a day for stability and nurturing"}
          </p>
        </div>
      </motion.section>

      {/* Lucky Details */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <div className="bg-card/50 backdrop-blur border border-border rounded-xl p-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Lucky Color:</span>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: luckyColor }} />
              <span className="capitalize">{ELEMENTS[userElement].produces}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Lucky Direction:</span>
              <span>{luckyDirection}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Lucky Hours:</span>
              <span>9-11am, 1-3pm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Lucky Number:</span>
              <span>{Math.floor(Math.random() * 9) + 1}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Email Capture */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <EmailCapture />
      </motion.section>

      {/* Wisdom Quote */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <div className="text-center py-8">
          <span className="text-4xl text-primary/30">"</span>
          <p className="font-serif text-lg italic text-foreground max-w-xl mx-auto">
            The wise ruler knows that timing is everything. Act when the elements align, rest when they conflict.
          </p>
          <p className="text-sm text-muted-foreground mt-3">— Grand Master Saju</p>
        </div>
      </motion.section>
    </div>
  );
}

// 25 unique element combination themes for weekly outlook
const DAY_THEMES: Record<string, { title: string; desc: string; tag: string }> = {
  wood_wood: { title: "The Double Growth", desc: "Creative energy doubles today. Start new projects, plant seeds, expand your vision. Your Wood nature is amplified.", tag: "CREATIVE PEAK" },
  wood_fire: { title: "The Blazing Forest", desc: "Your ideas catch fire today. Passion meets creativity — pitch that concept, share your vision, be bold in expression.", tag: "HIGH ENERGY" },
  wood_earth: { title: "Roots Run Deep", desc: "Ground your ambitions today. Focus on structure, planning, and building solid foundations for future growth.", tag: "FOUNDATION DAY" },
  wood_metal: { title: "The Tempering Edge", desc: "Expect challenges that sharpen you. Criticism today is a gift — use it to refine your approach and strengthen resolve.", tag: "GROWTH CHALLENGE" },
  wood_water: { title: "The Nourishing Flow", desc: "Wisdom flows easily today. Study, reflect, listen more than you speak. Water feeds your Wood — absorb and grow.", tag: "WISDOM DAY" },
  fire_wood: { title: "Fanning the Flames", desc: "Support arrives for your passions. Someone or something fuels your fire today. Accept help and burn brighter.", tag: "SUPPORT DAY" },
  fire_fire: { title: "The Inferno", desc: "Maximum intensity. Great for performances, presentations, and being seen. But watch for burnout — pace yourself.", tag: "INTENSITY PEAK" },
  fire_earth: { title: "Ashes to Foundation", desc: "Transform passion into results. Channel today's energy into concrete achievements, not just enthusiasm.", tag: "PRODUCTIVITY" },
  fire_metal: { title: "The Forge", desc: "Pressure shapes diamonds today. Expect tension but use it to create something lasting and valuable.", tag: "PRESSURE DAY" },
  fire_water: { title: "Steam Rising", desc: "Conflicting energies today. Your fire meets resistance — don't force outcomes. Patience reveals the path.", tag: "REST DAY" },
  earth_wood: { title: "Breaking Ground", desc: "New growth pushes through your stability. Embrace change today — it disrupts comfort but brings progress.", tag: "CHANGE DAY" },
  earth_fire: { title: "The Warm Earth", desc: "Nurturing energy radiates from you today. Relationships deepen, trust builds, others are drawn to your warmth.", tag: "RELATIONSHIP DAY" },
  earth_earth: { title: "The Mountain", desc: "Unmovable and centered. Perfect day for meditation, important decisions, and standing firm on your values.", tag: "POWER DAY" },
  earth_metal: { title: "Buried Treasure", desc: "Hidden value emerges today. Look beneath the surface — financial opportunities, forgotten ideas, untapped potential.", tag: "WEALTH DAY" },
  earth_water: { title: "The Eroding Shore", desc: "Flexibility required. Don't cling too tightly to plans today. Let things flow and adapt to what comes.", tag: "ADAPTABILITY" },
  metal_wood: { title: "The Pruning", desc: "Cut what no longer serves you. Declutter, end draining commitments, make decisive choices about your direction.", tag: "DECISIVE DAY" },
  metal_fire: { title: "The Melting Point", desc: "Rigid structures soften today. Good for negotiation, compromise, and finding middle ground in conflicts.", tag: "NEGOTIATION" },
  metal_earth: { title: "The Solid Ground", desc: "Support strengthens your discipline. A great day for financial planning, contracts, and long-term commitments.", tag: "COMMITMENT DAY" },
  metal_metal: { title: "The Mirror Edge", desc: "Clarity and precision peak today. Analyze, audit, and perfect. Details matter more than usual.", tag: "PRECISION DAY" },
  metal_water: { title: "The Flowing Blade", desc: "Your sharp mind meets intuition today. Excellent for strategic thinking that incorporates gut feelings.", tag: "STRATEGY DAY" },
  water_wood: { title: "The Spring Rain", desc: "Your wisdom nourishes new ideas. Mentor someone, teach what you know, water the seeds others have planted.", tag: "MENTOR DAY" },
  water_fire: { title: "The Hot Spring", desc: "Opposing energies create something unique today. Embrace contradictions — they lead to breakthroughs.", tag: "BREAKTHROUGH" },
  water_earth: { title: "The Dam", desc: "Obstacles redirect your flow. Don't fight the current — find the path of least resistance around barriers.", tag: "PATIENCE DAY" },
  water_metal: { title: "The Deep Well", desc: "Structured thinking enhances your intuition. A powerful day for research, analysis, and uncovering hidden truths.", tag: "INSIGHT DAY" },
  water_water: { title: "The Ocean", desc: "Infinite depth today. Your emotional intelligence and intuition are at peak. Trust your inner voice completely.", tag: "INTUITION PEAK" },
};

// Helper functions
function getElementRelationship(userElement: Element, dailyElement: Element): string {
  if (ELEMENTS[dailyElement].produces === userElement) return "supported";
  if (ELEMENTS[userElement].controls === dailyElement) return "controlling";
  if (ELEMENTS[dailyElement].controls === userElement) return "challenged";
  if (userElement === dailyElement) return "same";
  return "neutral";
}

function getDayTheme(userElement: Element, dayElement: Element): { title: string; desc: string; tag: string } {
  const key = `${userElement}_${dayElement}`;
  return DAY_THEMES[key] || { title: "The Unfolding Path", desc: "A day of balance and steady progress.", tag: "BALANCED" };
}

function getTag(relationship: string, element: Element): string {
  if (relationship === "supported") return "GROWTH DAY";
  if (relationship === "controlling") return "POWER DAY";
  if (relationship === "challenged") return "REST DAY";
  if (relationship === "same") return "HARMONY DAY";
  return "BALANCED";
}

function getDirection(element: Element): string {
  const directions: Record<Element, string> = {
    wood: "East",
    fire: "South",
    earth: "Center",
    metal: "West",
    water: "North",
  };
  return directions[element];
}
