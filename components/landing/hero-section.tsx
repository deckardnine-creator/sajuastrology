"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { NvidiaInceptionStrip } from "@/components/trust/nvidia-inception-strip"
import { useLanguage } from "@/lib/language-context"
import { useNativeApp } from "@/lib/native-app"
import { useAuth } from "@/lib/auth-context"
import { safeSet } from "@/lib/safe-storage"
import Link from "next/link"
import { useRouter } from "next/navigation"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rimfactory.sajuastrology"
const APP_STORE_URL = "https://apps.apple.com/us/app/sajuastrology/id6761590704"

// ════════════════════════════════════════════════════════════════
// v6.17.41: iOS App Store button temporarily disabled while v1.3.8
// is under Apple App Review. Old v1.2.1 build on the App Store has
// stale UI that conflicts with current website (v1.3.8) — Soram tab
// missing, paywall card missing 3.1.2(c) disclosures, footer dupes.
// New users downloading v1.2.1 + visiting the website would see a
// broken hybrid experience. Re-enable once v1.3.8 ships.
// To revert: set IOS_APP_AVAILABLE = true.
// ════════════════════════════════════════════════════════════════
const IOS_APP_AVAILABLE = true

const pillars = [
  { chinese: "甲", english: "Wood", element: "wood", color: "text-secondary" },
  { chinese: "丙", english: "Fire", element: "fire", color: "text-fire" },
  { chinese: "戊", english: "Earth", element: "earth", color: "text-primary" },
  { chinese: "庚", english: "Metal", element: "metal", color: "text-metal" },
]

export function HeroSection() {
  const [particles, setParticles] = useState<{x: string; y: string; scale: number; duration: number}[]>([])
  const [showCountryRanking, setShowCountryRanking] = useState(false)
  const [heroImageIdx, setHeroImageIdx] = useState(0)

  const heroImages = [
    { src: "/soram/soram_consultation.webp", alt: "Soram \u2014 A cat scholar reading saju" },
    { src: "/chansoram2.png", alt: "Chandler and Soram at Golden Gate Bridge" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIdx((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

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
    // v6.13: write intent as JSON envelope with 5-min TTL so a stale
    // intent from an abandoned signin can't redirect a future signin
    // back to /soram. See auth-context.tsx for the matching reader.
    try {
      safeSet(
        "post-signin-intent",
        JSON.stringify({ path: "/soram", expires: Date.now() + 5 * 60 * 1000 })
      )
    } catch {}
    openSignInModal()
  }

  return (
    /* v6.17.52 — Mobile vertical centering removed.
       Previously this section used `min-h-[80vh] ... flex items-center`
       which forced the hero text to vertical-center within 80% of the
       viewport on mobile, leaving a large empty band between the
       Navbar and the heading (chandler caught this on the home page:
       "헤더와 간격이 너무 먼데 궁합페이지 정도 간격으로"). On mobile
       we now flow normally — the content begins right under the
       Navbar's pt-page padding. Desktop (lg+) retains
       `lg:min-h-screen` so the split two-column layout still occupies
       the full viewport with vertically aligned columns. */
    <section className="relative overflow-hidden lg:min-h-screen pt-page pb-8 sm:pb-12 lg:flex lg:items-center">

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
            className="flex flex-col gap-2.5 sm:gap-4 pt-1 pb-4 sm:py-6 lg:py-0"
          >
            <h1 className="font-serif text-[1.625rem] xs:text-[1.875rem] sm:text-4xl lg:text-4xl xl:text-5xl font-bold leading-[1.1] break-words">
              {t("hero.title1")}
              <br className="sm:hidden" />
              <span className="gold-gradient-text">{" "}{t("hero.title2")}</span>
            </h1>

            <p className="text-base sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t("hero.desc")}
            </p>

            {/* Tech credibility line — green dot stays anchored to the
                first word so when the text wraps to multiple lines (long
                English/etc), the dot doesn't end up alone on its own row. */}
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 leading-relaxed">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse align-middle mr-1.5" />
              <span className="align-middle">{t("hero.techLine")}</span>
              {" "}
              <span
                role="button"
                tabIndex={0}
                onClick={() => setShowCountryRanking(true)}
                onKeyDown={(e) => e.key === "Enter" && setShowCountryRanking(true)}
                className="text-[11px] sm:text-xs text-emerald-400/70 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-400/30 hover:decoration-emerald-300/50 transition-colors cursor-pointer"
              >
                {locale === "ko" ? "(투명성이 브랜딩이다 😊 방문국가 확인하기 — GA4)" :
                 locale === "ja" ? "(透明性がブランディングだ 😊 訪問国を確認 — GA4)" :
                 locale === "es" ? "(La transparencia es branding 😊 Ver países — GA4)" :
                 locale === "fr" ? "(La transparence est du branding 😊 Voir les pays — GA4)" :
                 locale === "pt" ? "(Transparência é branding 😊 Ver países — GA4)" :
                 locale === "zh-TW" ? "(透明就是品牌 😊 查看訪問國家 — GA4)" :
                 locale === "ru" ? "(Прозрачность — это брендинг 😊 Страны — GA4)" :
                 locale === "hi" ? "(पारदर्शिता ब्रांडिंग है 😊 देश देखें — GA4)" :
                 locale === "id" ? "(Transparansi adalah branding 😊 Lihat negara — GA4)" :
                 "(Transparency is branding 😊 See countries — GA4)"}
              </span>
            </p>

            {/* GA4 Country Ranking Modal */}
            {showCountryRanking && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCountryRanking(false)}>
                <div
                  className="relative bg-[#1a1a2e] border border-emerald-400/30 rounded-xl w-[90vw] max-w-md h-[70vh] flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-400/20 shrink-0">
                    <span className="text-xs font-mono text-emerald-300/80 tracking-wider">
                      {locale === "ko" ? "국가별 방문순위 (GA4 실데이터 — May 9)" :
                       locale === "ja" ? "国別訪問ランキング（GA4実データ — May 9）" :
                       "Country Rankings (GA4 Live Data — May 9)"}
                    </span>
                    <button
                      onClick={() => setShowCountryRanking(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Scrollable image */}
                  <div className="flex-1 overflow-y-auto p-3">
                    <img
                      src="/population.png"
                      alt="GA4 Country Rankings"
                      className="w-full h-auto rounded"
                      loading="lazy"
                    />
                  </div>
                  {/* Scroll hint */}
                  <div className="flex items-center justify-center gap-2 py-2 border-t border-emerald-400/10 shrink-0">
                    <span className="text-[10px] text-emerald-400/40 font-mono">▲ ▼ scroll</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════
                Whitepaper button — top of the authority stack, sitting
                ABOVE the NVIDIA Inception strip. The whitepaper is our
                academic-authority signal; NVIDIA is the external-validation
                signal. Both are gated to web-only because Apple Guideline
                5.2.5 prohibits third-party marks in the native binary, and
                academic content can complicate the existing 4.3(b) review
                track if discovered through the app surface.
                
                Visual language:
                  - Glow: subtle gold pulse around the rounded card
                  - Compact height: py-3, NOT a thick CTA bar
                  - Web: items-start (left). Mobile: items-center.
                  - Spacing to NVIDIA = ~gap-3, mirroring the gap between
                    the two primary CTAs (Reading / Compatibility) below.
            ════════════════════════════════════════════════════════ */}
            {/* chandler 2026-05-01 (rev): Whitepaper button now visible on
                APP too. The whitepaper is our own asset (not a third-party
                mark), so Apple Guideline 5.2.5 does not gate it. NVIDIA
                Inception strip stays web-only — third-party mark must not
                ship in the native binary. */}
            {/* App Download Buttons — above authority stack, Apple first */}
            {!isNativeApp && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">

                {/* App Store (FIRST — v1.3.8 approved) */}
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

                {/* Google Play (SECOND) */}
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
              </div>
            </div>
            )}

            {/* ════ GROUP 1: Trust & Authority (Blue theme) ════ */}
            <div className="flex flex-col gap-2 w-full max-w-[420px] self-center sm:self-start">
              <NvidiaInceptionStrip />

              <Link
                href="/whitepaper"
                className="group flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.04] hover:bg-blue-500/[0.08] hover:border-blue-400/35 transition-all px-4 py-2.5"
              >
                <span className="text-[13px] text-blue-300/80">📄</span>
                <span className="flex-1 text-[13px] text-blue-200/90">{t("hero.whitepaperLink")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/blog/llm-saju-self-evaluation"
                className="group flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.04] hover:bg-blue-500/[0.08] hover:border-blue-400/35 transition-all px-4 py-2.5"
              >
                <span className="text-[13px] text-blue-300/80">🤖</span>
                <span className="flex-1 text-[13px] text-blue-200/90">{t("hero.llmExperimentBadge")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* ════ GROUP 2: Core Actions (Gold / Coral theme) ════ */}
            <div className="flex flex-col gap-2 w-full max-w-[420px] self-center sm:self-start mt-3">
              <Link href="/calculate" className="block">
                <div className="group flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] hover:border-amber-400/60 transition-all px-4 py-3 cursor-pointer">
                  <span className="text-[14px] text-amber-300">✨</span>
                  <span className="flex-1 text-[14px] font-medium text-amber-100">{t("hero.cta")}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400/70 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link href="/compatibility" className="block">
                <div className="group flex items-center gap-3 rounded-xl border border-orange-400/20 bg-orange-500/[0.04] hover:bg-orange-500/[0.08] hover:border-orange-400/35 transition-all px-4 py-3 cursor-pointer">
                  <span className="text-[14px] text-orange-300/80">💕</span>
                  <span className="flex-1 text-[14px] text-orange-200/90">{t("hero.ctaCompatibility")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <button onClick={handleSoramClick} className="text-left">
                <div className="group flex items-center gap-3 rounded-xl border border-orange-400/20 bg-orange-500/[0.04] hover:bg-orange-500/[0.08] hover:border-orange-400/35 transition-all px-4 py-3 cursor-pointer">
                  <span className="text-[14px] text-orange-300/80">💬</span>
                  <span className="flex-1 text-[14px] text-orange-200/90">{t("hero.askSoram")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            </div>

            {/* ════ GROUP 3: News & Community (Green theme) ════ */}
            <div className="flex flex-col gap-2 w-full max-w-[420px] self-center sm:self-start mt-3">
              <details className="group rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] transition-colors open:bg-emerald-500/[0.06]">
                <summary className="cursor-pointer list-none flex items-center gap-3 px-4 py-2.5 select-none">
                  <span className="text-[13px] text-emerald-300/80">📢</span>
                  <span className="flex-1 text-[13px] text-emerald-200/90">{t("hero.ceoMsgTitle")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400/50 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-3 pl-10 pt-0">
                  <p className="whitespace-pre-line text-[12px] text-emerald-100/80 leading-relaxed break-keep">
                    {t("hero.ceoMsgBody")}
                  </p>
                </div>
              </details>

              <Link
                href="/letter"
                className="group flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] hover:border-emerald-400/35 transition-all px-4 py-2.5"
              >
                <span className="text-[13px] text-emerald-300/80">🏛️</span>
                <span className="flex-1 text-[13px] text-emerald-200/90">{t("hero.letterLink")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="https://discord.gg/ynf9tHVt3"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] hover:border-emerald-400/35 transition-all px-4 py-2.5"
              >
                <span className="text-[13px] text-emerald-300/80">🐱</span>
                <span className="flex-1 text-[13px] text-emerald-200/90">{t("hero.discordLink")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
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

            {/* Hero image carousel — scholar Soram + bridge photo, 5s fade cycle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="block w-full max-w-[480px] mt-2"
              aria-label={t("hero.soramCaption")}
            >
              <div className="relative w-full aspect-[4/3] rounded-[14px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={heroImageIdx}
                    src={heroImages[heroImageIdx].src}
                    alt={heroImages[heroImageIdx].alt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    draggable={false}
                  />
                </AnimatePresence>
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
