"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const pillars = [
  { chinese: "甲", english: "Wood", element: "wood", color: "text-secondary" },
  { chinese: "丙", english: "Fire", element: "fire", color: "text-fire" },
  { chinese: "戊", english: "Earth", element: "earth", color: "text-primary" },
  { chinese: "庚", english: "Metal", element: "metal", color: "text-metal" },
]

export function HeroSection() {
  const [showComingSoon, setShowComingSoon] = useState<"ios" | "android" | null>(null)

  const handleAppClick = (platform: "ios" | "android") => {
    setShowComingSoon(platform)
    setTimeout(() => setShowComingSoon(null), 3000)
  }

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
              cosmic profiles. Get your free reading in 30 seconds — plus personalized
              daily fortune updates based on your chart.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/calculate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gold-gradient text-primary-foreground font-semibold text-base px-7 group w-full sm:w-auto"
                >
                  See My Reading — Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* App Download Buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAppClick("ios")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <span className="text-[9px] text-white/50 block leading-tight">Download on the</span>
                    <span className="text-sm text-white/90 font-medium leading-tight">App Store</span>
                  </div>
                </button>

                <button
                  onClick={() => handleAppClick("android")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.04L13.3 12.93 3.18.96 3.18 23.04zM14.42 11.83L5.3.46 19.03 8.3 14.42 11.83zM14.46 14.07L19.13 17.67 5.24 25.54 14.46 14.07zM20.17 9.48L22.03 10.56C22.72 10.95 22.72 11.95 22.03 12.35L20.05 13.48 15.58 12.92 20.17 9.48z"/>
                  </svg>
                  <div className="text-left">
                    <span className="text-[9px] text-white/50 block leading-tight">Get it on</span>
                    <span className="text-sm text-white/90 font-medium leading-tight">Google Play</span>
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {showComingSoon && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground/70"
                  >
                    <Smartphone className="w-3 h-3 inline mr-1" />
                    {showComingSoon === "ios" ? "iOS" : "Android"} app coming very soon — use the web app for now!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Four Pillars */}
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
