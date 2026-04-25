"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"
import { useAuth } from "@/lib/auth-context"
import { safeSet } from "@/lib/safe-storage"
import Link from "next/link"
import { useRouter } from "next/navigation"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rimfactory.sajuastrology"
const APP_STORE_URL = "https://apps.apple.com/us/app/sajuastrology/id6761590704"

const pillars = [
  { chinese: "甲", english: "Wood", element: "wood", color: "text-secondary" },
  { chinese: "丙", english: "Fire", element: "fire", color: "text-fire" },
  { chinese: "戊", english: "Earth", element: "earth", color: "text-primary" },
  { chinese: "庚", english: "Metal", element: "metal", color: "text-metal" },
]

export function HeroSection() {
  const [particles, setParticles] = useState<{x: string; y: string; scale: number; duration: number}[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 10 + 10,
      }))
    )
  }, [])
  const { t, locale } = useLanguage()
  const isNativeApp = useNativeApp()
  const { user, openSignInModal } = useAuth()
  const router = useRouter()

  // ════════════════════════════════════════════════════════════════
  // Soram entry handler — bridges the "Talk to Soram" card click
  // through every possible auth state into the right destination.
  //
  // States covered:
  //   1. Not signed in        → store intent + open modal (stay on home).
  //                             auth-context picks up the intent post-signin
  //                             and full-redirects to /soram.
  //   2. Signed in            → router.push to /soram. The /soram page
  //                             itself handles the "no primary chart yet"
  //                             redirect to /setup-primary-chart?next=/soram,
  //                             so we don't duplicate that branch here.
  //
  // We deliberately DON'T render this as a plain <Link> because the
  // logged-out branch must NOT navigate to /soram (which would briefly
  // mount the chat page, fail its auth gate, and bounce back via
  // router.replace — visible flicker). Click handler with preventDefault
  // keeps the user on the home page until the modal closes.
  // ════════════════════════════════════════════════════════════════
  const handleSoramClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      router.push("/soram")
      return
    }
    try { safeSet("post-signin-intent", "/soram") } catch {}
    openSignInModal()
  }

  return (
    <section className="relative overflow-hidden min-h-[80vh] lg:min-h-screen pt-page pb-8 sm:pb-12 flex items-center">

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
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{ x: p.x, y: p.y, scale: p.scale }}
            animate={{ y: [null, "-20%"], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 lg:gap-8 items-center lg:min-h-[calc(100vh-8rem)]">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-5 sm:gap-4 py-6 sm:py-6 lg:py-0"
          >
            <h1 className="font-serif text-[2rem] xs:text-[2.25rem] sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.25] break-words">
              {t("hero.title1")}
              <br className="sm:hidden" />
              <span className="gold-gradient-text">{" "}{t("hero.title2")}</span>
            </h1>

            <p className="text-base sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t("hero.desc")}
            </p>

            {/* Tech credibility line */}
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 flex items-center gap-1.5 flex-wrap">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              {t("hero.techLine")}
            </p>

            {/* ════════════════════════════════════════════════════════
                v1.3 Sprint 2-B: Talk to Soram entry card
                Centerpiece of the v1.3 product — placed above the
                primary CTA stack. Click handler routes through
                auth-aware logic in handleSoramClick (see top of
                component) so logged-out users see the sign-in
                modal in place instead of bouncing through /soram.
                
                Avatar: loads /soram/soram_hero.webp (a 320px circular
                close-up of Soram with constellation background — kept
                visually distinct from the bottom-nav avatar so the same
                image isn't repeated in two places on the same screen).
                If missing in production, the onError handler hides the
                <img> and the parent's gold background + 🌙 stays visible — graceful fallback,
                no broken-image icon.
                
                v6 patch: hidden in native app (isNativeApp=true).
                Reason — Soram entry flow is still being polished
                (next ~3 days of iteration: greeting copy, expression
                rotation, paid-tier link, error handling). To prevent
                native-app users from hitting a half-finished flow
                during that polish window, we simply don't show the
                entry card inside the Flutter shell. The mobile
                bottom-nav Soram tab is also natively hidden because
                MobileBottomNav globally returns null when isNative.
                Web visitors still get the card (they're a smaller
                cohort and we can iterate visibly with them).
            ════════════════════════════════════════════════════════ */}
            {!isNativeApp && (
            <button
              type="button"
              onClick={handleSoramClick}
              className="block text-left w-full sm:w-[420px] mt-2 group"
              aria-label={t("hero.askSoram")}
            >
              <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent backdrop-blur-sm p-4 sm:p-5 transition-all duration-200 hover:border-amber-300/70 hover:shadow-[0_8px_24px_rgba(234,179,8,0.25)] active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  {/* Soram avatar — gold circle. We layer an <img> on
                      top; it falls back to the moon glyph + gradient
                      background if the avatar asset isn't found. */}
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-2xl sm:text-3xl shadow-md shadow-amber-500/30 shrink-0 overflow-hidden">
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">🌙</span>
                    <img
                      src="/soram/soram_hero.webp"
                      alt=""
                      aria-hidden="true"
                      onError={(ev) => {
                        const el = ev.currentTarget;
                        el.style.display = "none";
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-amber-100 leading-snug">
                      {t("hero.askSoram")}
                    </p>
                    <p className="text-[11px] sm:text-xs text-amber-200/70 leading-relaxed mt-0.5 line-clamp-2">
                      {t("hero.askSoramSub")}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
            )}

            {/* CTA buttons — 2 rows, always vertical stack, equal fixed width (280px) */}
            <div className="flex flex-col items-center sm:items-start gap-3 mt-2">
              {/* Primary: Free saju reading */}
              <Link href="/calculate" className="block w-[280px] lg:w-auto">
                <Button
                  size="lg"
                  className="gold-gradient text-primary-foreground font-semibold text-base px-6 group w-full lg:w-auto transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(234,179,8,0.35)] active:scale-[0.99]"
                >
                  <span className="truncate lg:overflow-visible lg:whitespace-nowrap">{t("hero.cta")}</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              {/* Secondary: Compatibility check (free) */}
              <Link href="/compatibility" className="block w-[280px] lg:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold text-base px-6 group w-full lg:w-auto transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span className="truncate lg:overflow-visible lg:whitespace-nowrap">{t("hero.ctaCompatibility")}</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* App Download Buttons — hidden inside native app */}
            {!isNativeApp && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">

                {/* Google Play (FIRST — Released) */}
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:border-white/30 hover:bg-white/10 transition-all group w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.04L13.3 12.93 3.18.96 3.18 23.04zM14.42 11.83L5.3.46 19.03 8.3 14.42 11.83zM14.46 14.07L19.13 17.67 5.24 25.54 14.46 14.07zM20.17 9.48L22.03 10.56C22.72 10.95 22.72 11.95 22.03 12.35L20.05 13.48 15.58 12.92 20.17 9.48z"/>
                  </svg>
                  <span className="text-sm text-white/90 font-medium leading-tight">{t("hero.googlePlay")}</span>
                </a>

                {/* App Store (Released) */}
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:border-white/30 hover:bg-white/10 transition-all group w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-sm text-white/90 font-medium leading-tight">{t("hero.appStore")}</span>
                </a>
              </div>
            </div>
            )}

            {/* ════════════════════════════════════════════════════════
                v1.3 Sprint 2-B: Letter + Celebrity links MOVED HERE,
                below app download buttons (per chandler 12-item brief).
                Previously they sat above the CTA stack and competed with
                the primary "Get reading" path. Demoted to small links so
                Soram + Reading + Compatibility can own the prime real
                estate.
            ════════════════════════════════════════════════════════ */}
            <div className="flex flex-col gap-2 mt-1">
              {/* Letter (CEO message) link — centered on mobile */}
              <Link
                href="/letter"
                className="text-[13px] sm:text-[14px] text-muted-foreground/85 hover:text-primary transition-colors inline-flex items-center gap-1.5 self-center sm:self-start"
              >
                <span>
                  {t("hero.letterLink")}
                </span>
              </Link>

              {/* Celebrity Readings link */}
              <a
                href="https://blog.sajuastrology.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] sm:text-[15px] text-[#d4af37] hover:text-[#f5d76e] transition-colors text-center sm:text-left"
              >
                {t("hero.celebLink")}
              </a>
            </div>
          </motion.div>

          {/* Right: Four Pillars + Soram image — CENTER aligned on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center lg:items-center justify-center gap-5 lg:gap-7 pb-4 sm:pb-8 lg:pb-0"
          >
            {/* Four Pillars — mobile size unchanged, desktop 1.4x larger */}
            <div className="flex gap-1.5 xs:gap-2 sm:gap-3 lg:gap-5">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.chinese}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`pillar-card rounded-xl lg:rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-8 flex flex-col items-center gap-1.5 lg:gap-5 glow-${pillar.element} min-w-0`}
                >
                  <span className={`text-2xl xs:text-3xl sm:text-4xl lg:text-7xl xl:text-8xl font-serif ${pillar.color}`}>
                    {pillar.chinese}
                  </span>
                  <span className="text-[8px] xs:text-[9px] sm:text-xs lg:text-sm text-muted-foreground uppercase tracking-wider">
                    {pillar.english}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Soram cinematic image — display only, no link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="block w-full max-w-[480px] mt-2"
              aria-label={t("hero.soramCaption")}
            >
              <div
                className="relative w-full aspect-[16/9] rounded-[14px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                {/* Use plain <img> with eager loading (first-impression element; no lazy) */}
                <img
                  src="/soram/soram_consultation.webp"
                  alt="Soram — A cat scholar reading saju"
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <p className="text-center mt-3 text-[13px] italic tracking-[0.3px] font-serif"
                 style={{ color: "rgba(234, 179, 8, 0.85)", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                — {t("hero.soramCaption")} —
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
