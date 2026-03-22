"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gauge, TrendingUp, Heart, Sparkles, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features = [
  {
    id: "daily",
    icon: Gauge,
    title: "Daily Destiny Score",
    tagline: "Know your energy before the day begins.",
    description:
      "Every day carries a different cosmic energy based on the Five Elements. Your Daily Destiny Score shows how today's energy interacts with your unique birth blueprint — giving you an edge in timing.",
    bullets: [
      "Personalized score from 0–100 updated daily",
      "Wealth, Love, and Career sub-scores",
      "Lucky colors, directions, and power hours",
    ],
    cta: { label: "See My Daily Score", href: "/daily" },
    accentColor: "from-amber-500/20 to-yellow-500/10",
    glowColor: "bg-amber-400/30",
    mockup: <DailyMockup />,
  },
  {
    id: "wealth",
    icon: TrendingUp,
    title: "Wealth & Career Blueprint",
    tagline: "10 years of fortune cycles, mapped.",
    description:
      "Your financial destiny follows predictable elemental cycles. See which years are your peak wealth periods, when to take risks, and when to consolidate — all derived from your Four Pillars.",
    bullets: [
      "10-year luck pillar cycle analysis",
      "Peak wealth years highlighted",
      "Career move timing recommendations",
    ],
    cta: { label: "Unlock My Blueprint", href: "/pricing" },
    accentColor: "from-green-500/20 to-teal-500/10",
    glowColor: "bg-green-400/30",
    mockup: <WealthMockup />,
  },
  {
    id: "love",
    icon: Heart,
    title: "Love Synergy",
    tagline: "Not just signs — full elemental harmony.",
    description:
      "True compatibility goes beyond surface-level zodiac matching. Saju maps the elemental interaction between two people's complete birth charts, revealing deep harmony and friction points.",
    bullets: [
      "Full compatibility score with any birth date",
      "Element harmony & conflict mapping",
      "Optimal relationship windows in your cycle",
    ],
    cta: { label: "Check Compatibility", href: "/love" },
    accentColor: "from-pink-500/20 to-rose-500/10",
    glowColor: "bg-pink-400/30",
    mockup: <LoveMockup />,
  },
  {
    id: "oracle",
    icon: Sparkles,
    title: "Oracle Chat",
    tagline: "1,000 years of wisdom. Ask anything.",
    description:
      "Your personal AI oracle trained on classical Saju texts and your unique birth chart. Ask about career moves, relationship timing, or life decisions — and receive guidance rooted in your cosmic blueprint.",
    bullets: [
      "Answers grounded in your Four Pillars",
      "Career, love, and life path questions",
      "Available 24/7, unlimited questions",
    ],
    cta: { label: "Start Free Reading", href: "/calculate" },
    accentColor: "from-purple-500/20 to-indigo-500/10",
    glowColor: "bg-purple-400/30",
    mockup: <OracleMockup />,
  },
]

export function FeaturesSection() {
  const [activeId, setActiveId] = useState("daily")
  const active = features.find((f) => f.id === activeId)!

  return (
    <section id="features" className="relative py-24 overflow-hidden">

      {/* Five-element themed orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-green-600/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-cyan-400/15 blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-700/20 blur-[110px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to navigate your cosmic journey
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map((f) => {
            const Icon = f.icon
            const isActive = f.id === activeId
            return (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.title}
              </button>
            )
          })}
        </div>

        {/* Main content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: text */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-primary text-sm font-medium mb-2">{active.tagline}</p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                  {active.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {active.description}
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {active.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>

              <Link href={active.cta.href}>
                <Button className="gold-gradient text-primary-foreground font-semibold group w-fit">
                  {active.cta.label}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Right: mockup */}
            <div className={`relative rounded-2xl bg-gradient-to-br ${active.accentColor} border border-border/50 p-1 overflow-hidden`}>
              {/* glow behind mockup */}
              <div className={`absolute inset-0 ${active.glowColor} blur-3xl opacity-30 pointer-events-none`} />
              <div className="relative rounded-xl overflow-hidden bg-card/80 backdrop-blur">
                {active.mockup}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ── Mockup components ── */

function DailyMockup() {
  return (
    <div className="p-6 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Today's Energy</p>
          <p className="font-serif text-lg font-bold text-foreground">Sunday, Mar 22</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Day Master</p>
          <p className="text-sm font-medium text-amber-400">Fire 丙</p>
        </div>
      </div>
      {/* Score ring */}
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F2CA50" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${78 * 2.51} ${100 * 2.51}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-serif font-bold text-foreground">78</span>
            <span className="text-xs text-amber-400">Strong</span>
          </div>
        </div>
      </div>
      {/* Sub-scores */}
      <div className="grid grid-cols-3 gap-2">
        {[["Wealth", 85, "#22c55e"], ["Love", 72, "#ec4899"], ["Career", 90, "#3b82f6"]].map(([label, val, color]) => (
          <div key={label as string} className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="h-1 rounded-full bg-muted/50 mb-1">
              <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color as string }} />
            </div>
            <p className="text-xs font-medium" style={{ color: color as string }}>{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <p className="text-xs text-amber-400/80 italic">"The Blazing Forest — Your ideas catch fire today. Pitch that concept."</p>
      </div>
    </div>
  )
}

function WealthMockup() {
  const bars = [55, 62, 70, 88, 95, 72, 60, 85, 78, 65]
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-1">10-Year Fortune Cycle</p>
      <p className="font-serif text-lg font-bold text-foreground mb-4">2024 — 2034</p>
      <div className="flex items-end gap-1.5 h-28 mb-3">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${h}%`,
                backgroundColor: h >= 85 ? "#F2CA50" : h >= 70 ? "#3b82f6" : "#888780",
                opacity: h >= 85 ? 1 : 0.5,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>2024</span><span>2029</span><span>2034</span>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-muted-foreground">Peak years</span></div>
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500/50" /><span className="text-muted-foreground">Growth</span></div>
        <div className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-sm bg-muted/50" /><span className="text-muted-foreground">Consolidate</span></div>
      </div>
    </div>
  )
}

function LoveMockup() {
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-3">Compatibility Analysis</p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">火</div>
          <span className="text-xs text-muted-foreground">You</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full" style={{ width: "94%" }} />
          </div>
          <span className="text-lg font-serif font-bold text-pink-400">94%</span>
          <span className="text-xs text-muted-foreground">Synergy</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-lg">金</div>
          <span className="text-xs text-muted-foreground">Partner</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[["Fire × Metal", "Creative tension", "#F472B6"], ["Element match", "High harmony", "#a78bfa"]].map(([label, val, color]) => (
          <div key={label as string} className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: color as string }}>{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 bg-pink-500/10 rounded-lg border border-pink-500/20 text-xs text-pink-400/80">
        Best window: 2026 Q3 · Peak connection period
      </div>
    </div>
  )
}

function OracleMockup() {
  return (
    <div className="p-6 select-none">
      <p className="text-xs text-muted-foreground mb-3">Oracle Chat</p>
      <div className="flex flex-col gap-2.5">
        <div className="self-end bg-primary/20 text-foreground text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
          Should I change careers this year?
        </div>
        <div className="self-start flex gap-2 max-w-[90%]">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted/40 text-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2">
            Your Metal Day Master enters a strong Wood luck pillar in 2026. This creates the ideal tension for a career pivot — especially in creative or growth industries...
          </div>
        </div>
        <div className="self-end bg-primary/20 text-foreground text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
          What about timing?
        </div>
        <div className="self-start flex gap-2 max-w-[90%]">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted/40 text-muted-foreground text-xs rounded-2xl rounded-bl-sm px-3 py-2 italic">
            Typing...
          </div>
        </div>
      </div>
    </div>
  )
}
