"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LiveCounterSimple } from "./live-counter"

const pillars = [
  { chinese: "甲", english: "Wood", element: "wood", color: "text-secondary" },
  { chinese: "丙", english: "Fire", element: "fire", color: "text-fire" },
  { chinese: "戊", english: "Earth", element: "earth", color: "text-primary" },
  { chinese: "庚", english: "Metal", element: "metal", color: "text-metal" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-12 overflow-hidden">

      {/* Glow orbs */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-purple-700/25 blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 -right-24 w-[300px] h-[300px] lg:w-[480px] lg:h-[480px] rounded-full bg-yellow-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-0 left-1/3 w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ y: [null, "-20%"], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-5 py-8 lg:py-0"
          >
            <h1 className="font-serif text-[2rem] sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15]">
              Your Birth Date Holds a{" "}
              <span className="gold-gradient-text">5,000-Year-Old Code.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Western astrology gives you 1 of 12 types. Saju gives you 1 of{" "}
              <span className="text-primary font-semibold">518,400</span> unique
              cosmic profiles. Enter your birth details and decode your destiny in 30 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/calculate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gold-gradient text-primary-foreground font-semibold text-base px-7 group w-full sm:w-auto"
                >
                  Decode My Destiny
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground">
                <LiveCounterSimple startValue={2347892} />
              </span>
              <span>Readings Delivered</span>
            </motion.div>
          </motion.div>

          {/* Right: Four Pillars — 모바일에서 작게, 데스크탑에서 크게 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end pb-8 lg:pb-0"
          >
            <div className="flex gap-2 sm:gap-3 lg:gap-4">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.chinese}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`pillar-card rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col items-center gap-2 lg:gap-4 glow-${pillar.element}`}
                >
                  <span className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif ${pillar.color}`}>
                    {pillar.chinese}
                  </span>
                  <span className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                    {pillar.english}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
