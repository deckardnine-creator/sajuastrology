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
  const [noticeDismissed, setNoticeDismissed] = useState(true)

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
    try {
      const dismissed = localStorage.getItem("notice-may18-output-upgrade")
      if (!dismissed) setNoticeDismissed(false)
    } catch {}
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
            {/* Solar term fix notice banner — above heading */}
            <AnimatePresence>
              {!noticeDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-1"
                >
                  <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5" style={{ border: "0.5px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.08)" }}>
                    <span className="shrink-0 text-sm">{"\u2728"}</span>
                    <p className="flex-1 text-xs leading-relaxed text-[#bbb] sm:text-[13px]">
                      {locale === "ko"
                        ? "18\uC77C \u2014 \uC0AC\uC8FC\uD480\uC774, \uC18C\uB78C\uACFC\uC758 \uB300\uD654, \uAD81\uD569\uC758 \uCD9C\uB825\uBB3C\uC744 \uACE0\uAC1D \uCE5C\uD654\uC801\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC \uD558\uC600\uC2B5\uB2C8\uB2E4."
                        : locale === "ja"
                        ? "18\u65E5 \u2014 \u56DB\u67F1\u8AAD\u307F\u89E3\u304D\u30FB\u30BD\u30E9\u30E0\u3068\u306E\u5BFE\u8A71\u30FB\u76F8\u6027\u306E\u51FA\u529B\u3092\u304A\u5BA2\u69D8\u5411\u3051\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u307E\u3057\u305F\u3002"
                        : locale === "es"
                        ? "18 \u2014 Lectura, chat con Soram y compatibilidad mejorados para una mejor experiencia."
                        : locale === "fr"
                        ? "18 \u2014 Lecture, chat avec Soram et compatibilit\u00E9 am\u00E9lior\u00E9s pour une meilleure exp\u00E9rience."
                        : locale === "pt"
                        ? "18 \u2014 Leitura, chat com Soram e compatibilidade aprimorados para uma experi\u00EAncia melhor."
                        : locale === "zh-TW"
                        ? "18\u65E5 \u2014 \u56DB\u67F1\u89E3\u8B80\u3001\u7D22\u85CD\u5C0D\u8A71\u3001\u5408\u76E4\u7684\u8F38\u51FA\u5DF2\u5347\u7D1A\u70BA\u66F4\u512A\u8CEA\u7684\u9AD4\u9A57\u3002"
                        : locale === "ru"
                        ? "18-\u0435 \u2014 \u0427\u0442\u0435\u043D\u0438\u0435, \u0447\u0430\u0442 \u0441 \u0421\u043E\u0440\u0430\u043C \u0438 \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u044B \u0434\u043B\u044F \u043B\u0443\u0447\u0448\u0435\u0433\u043E \u043E\u043F\u044B\u0442\u0430."
                        : locale === "hi"
                        ? "18 \u2014 \u0938\u093E\u091C\u0942 \u0930\u0940\u0921\u093F\u0902\u0917, \u0938\u094B\u0930\u093E\u092E \u091A\u0948\u091F \u0914\u0930 \u0905\u0928\u0941\u0915\u0942\u0932\u0924\u093E \u0915\u094B \u092C\u0947\u0939\u0924\u0930 \u0905\u0928\u0941\u092D\u0935 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0917\u094D\u0930\u0947\u0921 \u0915\u093F\u092F\u093E\u0964"
                        : locale === "id"
                        ? "18 \u2014 Bacaan, chat Soram, dan kompatibilitas ditingkatkan untuk pengalaman yang lebih baik."
                        : "May 18 \u2014 Saju reading, Soram chat, and compatibility outputs upgraded for a better experience."}
                    </p>
                    <button
                      onClick={() => {
                        setNoticeDismissed(true)
                        try { localStorage.setItem("notice-may18-output-upgrade", "1") } catch {}
                      }}
                      className="shrink-0 p-0.5 text-[#666] transition-colors hover:text-[#999] text-base leading-none"
                      aria-label="Dismiss notice"
                    >
                      {"\u00D7"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      {locale === "ko" ? "국가별 방문순위 (GA4 실데이터 — May 15)" :
                       locale === "ja" ? "国別訪問ランキング（GA4実データ — May 15）" :
                       "Country Rankings (GA4 Live Data — May 15)"}
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
                      src="/ga4_65.png"
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
                <span className="flex-1 text-[13px] text-blue-200/90">
                  {locale === "ko" ? "📄 림사주 엔진 v2 백서" : locale === "ja" ? "📄 RimSaju\u30A8\u30F3\u30B8\u30F3 v2 \u767D\u66F8" : "📄 RimSaju Engine v2 Whitepaper"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/blog/llm-saju-self-evaluation"
                className="group flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/[0.04] hover:bg-blue-500/[0.08] hover:border-blue-400/35 transition-all px-4 py-2.5"
              >
                <span className="flex-1 text-[13px] text-blue-200/90">
                  {locale === "ko" ? "🤖 최신 LLM에게 Rim엔진V1과 비교한 자기점수를 물었습니다" : locale === "ja" ? "🤖 \u6700\u65B0LLM\u306BRim\u30A8\u30F3\u30B8\u30F3V1\u3068\u306E\u6BD4\u8F03\u81EA\u5DF1\u8A55\u4FA1\u3092\u805E\u3044\u305F" : "🤖 We asked top LLMs to self-score against RimSaju V1"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* ════ GROUP 2: Core Actions (Gold / Coral theme) ════ */}
            <div className="flex flex-col gap-2 w-full max-w-[420px] self-center sm:self-start mt-3">
              <Link href="/calculate" className="block">
                <div className="group flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] hover:border-amber-400/60 transition-all px-4 py-3 cursor-pointer">
                  <span className="flex-1 text-[14px] font-medium text-amber-100">{"\u2728 "}{t("hero.cta")}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400/70 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <Link href="/compatibility" className="block">
                <div className="group flex items-center gap-3 rounded-xl border border-orange-400/20 bg-orange-500/[0.04] hover:bg-orange-500/[0.08] hover:border-orange-400/35 transition-all px-4 py-3 cursor-pointer">
                  <span className="flex-1 text-[14px] text-orange-200/90">{"\uD83D\uDC95 "}{t("hero.ctaCompatibility")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <button onClick={handleSoramClick} className="text-left">
                <div className="group flex items-center gap-3 rounded-xl border border-orange-400/20 bg-orange-500/[0.04] hover:bg-orange-500/[0.08] hover:border-orange-400/35 transition-all px-4 py-3 cursor-pointer">
                  <span className="flex-1 text-[14px] text-orange-200/90">{"\uD83D\uDCAC "}{t("hero.askSoram")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            </div>

            {/* ════ GROUP 3: News & Community (Green theme) ════ */}
            <div className="flex flex-col gap-2 w-full max-w-[420px] self-center sm:self-start mt-3">
              <details className="group rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] transition-colors open:bg-emerald-500/[0.06]">
                <summary className="cursor-pointer list-none flex items-center gap-3 px-4 py-2.5 select-none">
                  <span className="flex-1 text-[13px] text-emerald-200/90">
                    {locale === "ko" ? "📢 소식" :
                     locale === "ja" ? "📢 お知らせ" :
                     "📢 News"}
                  </span>
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
                <span className="flex-1 text-[13px] text-emerald-200/90">
                  {locale === "ko" ? "🏛️ 림팩토리의 편지" : locale === "ja" ? "🏛️ Rimfactoryの手紙" : "🏛️ A letter from Rimfactory"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="https://discord.gg/ynf9tHVt3"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] hover:border-emerald-400/35 transition-all px-4 py-2.5"
              >
                <span className="flex-1 text-[13px] text-emerald-200/90">
                  {locale === "ko" ? "🐱 소람의 아지트 (Discord)" : locale === "ja" ? "🐱 ソラムのアジト (Discord)" : "🐱 Soram's Den (Discord)"}
                </span>
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

            {/* ════ Hiring terminal box — below Soram ════ */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="w-full max-w-[480px] mt-4"
            >
              <div className="rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] font-mono text-[11.5px] leading-[1.65] shadow-lg">
                {/* Terminal title bar */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]/80" />
                  <span className="ml-2 text-[10px] text-[#8b949e]">rimfactory ~ hiring</span>
                </div>
                {/* Terminal body */}
                <div className="px-3.5 py-3 text-[#c9d1d9] space-y-2">
                  <p className="text-[#3fb950] font-bold">{
                    locale === "ko" ? "\uCC44\uC6A9(~Jun 30) \u2014 \uC810\uC220 \uCE74\uD14C\uACE0\uB9AC \uC138\uACC4 1\uC704 \uD568\uAED8 \uB9CC\uB4E4 \uC0AC\uB78C" :
                    locale === "ja" ? "\u63A1\u7528(~6\u670830\u65E5) \u2014 \u5360\u3044\u30AB\u30C6\u30B4\u30EA\u30FC\u4E16\u754C1\u4F4D\u3092\u4E00\u7DD2\u306B\u4F5C\u308B\u4EBA" :
                    locale === "es" ? "Contratando (~Jun 30) \u2014 alguien para construir el #1 en adivinaci\u00F3n, juntos" :
                    locale === "fr" ? "Recrutement (~Jun 30) \u2014 quelqu\u2019un pour construire le #1 en divination, ensemble" :
                    locale === "pt" ? "Contratando (~Jun 30) \u2014 algu\u00E9m para construir o #1 em adivinha\u00E7\u00E3o, juntos" :
                    locale === "zh-TW" ? "\u62DB\u52DF\u4E2D(~6\u670830\u65E5) \u2014 \u4E00\u8D77\u6253\u9020\u5360\u535C\u985E\u5225\u7684\u4E16\u754C\u7B2C\u4E00" :
                    locale === "ru" ? "\u041D\u0430\u0431\u043E\u0440 (~30 \u0438\u044E\u043D\u044F) \u2014 \u0441\u0442\u0440\u043E\u0438\u043C #1 \u0432 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u0433\u0430\u0434\u0430\u043D\u0438\u044F \u0432\u043C\u0435\u0441\u0442\u0435" :
                    locale === "hi" ? "\u092D\u0930\u094D\u0924\u0940 (~\u091C\u0942\u0928 30) \u2014 \u092D\u0935\u093F\u0937\u094D\u092F\u0935\u093E\u0923\u0940 \u0936\u094D\u0930\u0947\u0923\u0940 \u092E\u0947\u0902 #1 \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F" :
                    locale === "id" ? "Rekrutmen (~Jun 30) \u2014 seseorang untuk membangun #1 di kategori ramalan, bersama" :
                    "Hiring (~Jun 30) \u2014 someone to build #1 in divination, together"
                  }</p>
                  <p>{
                    locale === "ko" ? "\uC548\uB155\uD558\uC138\uC694. \uC6B4\uC601\uC790\uC785\uB2C8\uB2E4. DAU 60\uC9DC\uB9AC(\uAD11\uACE0\uBE440, \uAC80\uC0C9\uC720\uC785) \uC11C\uBE44\uC2A4\uC758 \uD14C\uC2A4\uD2B8 \uAE30\uAC04\uC774\uB77C \uD3B8\uD558\uAC8C \uB0A8\uAE41\uB2C8\uB2E4. \uC6B0\uC120 \uC800\uD76C \uC11C\uBE44\uC2A4 \uC774\uC6A9\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4. \uC694\uC998 \uC774 \uC11C\uBE44\uC2A4\uB97C \uC5F4\uC2EC\uD788 \uC4F0\uC2DC\uB294 \uBD84\uB4E4\uC774 \uC0DD\uACA8\uC11C \uBCF4\uB78C\uC744 \uB290\uB08C\uB2C8\uB2E4." :
                    locale === "ja" ? "\u3053\u3093\u306B\u3061\u306F\u3002\u904B\u55B6\u8005\u3067\u3059\u3002DAU 60\uFF08\u5E83\u544A\u8CBB0\u3001\u691C\u7D22\u6D41\u5165\uFF09\u306E\u30C6\u30B9\u30C8\u671F\u9593\u3067\u3059\u306E\u3067\u6C17\u8EFD\u306B\u66F8\u3044\u3066\u3044\u307E\u3059\u3002\u3054\u5229\u7528\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u6700\u8FD1\u3001\u3053\u306E\u30B5\u30FC\u30D3\u30B9\u3092\u71B1\u5FC3\u306B\u304A\u4F7F\u3044\u306E\u65B9\u304C\u73FE\u308C\u3001\u52B1\u307F\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002" :
                    locale === "es" ? "Hola del operador. DAU 60 ($0 en publicidad, solo b\u00FAsqueda org\u00E1nica), a\u00FAn en pruebas. Gracias por usar nuestro servicio. Estamos viendo usuarios que realmente aman usar este servicio, y es alentador." :
                    locale === "fr" ? "Bonjour de l\u2019op\u00E9rateur. DAU 60 (0$ en pub, recherche organique uniquement), encore en test. Merci d\u2019utiliser notre service. Nous voyons des utilisateurs qui adorent vraiment ce service, c\u2019est encourageant." :
                    locale === "pt" ? "Ol\u00E1 do operador. DAU 60 ($0 em publicidade, apenas busca org\u00E2nica), ainda em teste. Obrigado por usar nosso servi\u00E7o. Estamos vendo usu\u00E1rios que realmente adoram usar este servi\u00E7o, e isso \u00E9 encorajador." :
                    locale === "zh-TW" ? "\u4F60\u597D\uFF0C\u904B\u71DF\u8005\u3002DAU 60\uFF08\u5EE3\u544A\u8CBB0\uFF0C\u641C\u5C0B\u6D41\u5165\uFF09\uFF0C\u4ECD\u5728\u6E2C\u8A66\u4E2D\u3002\u611F\u8B1D\u4F7F\u7528\u6211\u5011\u7684\u670D\u52D9\u3002\u6700\u8FD1\u770B\u5230\u71B1\u611B\u4F7F\u7528\u672C\u670D\u52D9\u7684\u7528\u6236\u51FA\u73FE\uFF0C\u975E\u5E38\u9F13\u52F5\u3002" :
                    locale === "ru" ? "\u041F\u0440\u0438\u0432\u0435\u0442 \u043E\u0442 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430. DAU 60 ($0 \u043D\u0430 \u0440\u0435\u043A\u043B\u0430\u043C\u0443, \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0440\u0433\u0430\u043D\u0438\u043A\u0430), \u0435\u0449\u0451 \u0442\u0435\u0441\u0442\u0438\u0440\u0443\u0435\u043C. \u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435. \u041C\u044B \u0432\u0438\u0434\u0438\u043C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439, \u043A\u043E\u0442\u043E\u0440\u044B\u043C \u044D\u0442\u043E\u0442 \u0441\u0435\u0440\u0432\u0438\u0441 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043D\u0440\u0430\u0432\u0438\u0442\u0441\u044F \u2014 \u044D\u0442\u043E \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u043B\u044F\u0435\u0442." :
                    locale === "hi" ? "\u0911\u092A\u0930\u0947\u091F\u0930 \u0915\u0940 \u0913\u0930 \u0938\u0947\u0964 DAU 60 ($0 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928, \u0915\u0947\u0935\u0932 \u0911\u0930\u094D\u0917\u0947\u0928\u093F\u0915), \u0905\u092D\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u092E\u0947\u0902\u0964 \u0939\u092E\u093E\u0930\u0940 \u0938\u0947\u0935\u093E \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u0910\u0938\u0947 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0926\u093F\u0916 \u0930\u0939\u0947 \u0939\u0948\u0902 \u091C\u094B \u0938\u091A\u092E\u0941\u091A \u0907\u0938 \u0938\u0947\u0935\u093E \u0915\u094B \u092A\u0938\u0902\u0926 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902 \u2014 \u092F\u0939 \u0939\u094C\u0938\u0932\u093E \u0926\u0947\u0924\u093E \u0939\u0948\u0964" :
                    locale === "id" ? "Halo dari operator. DAU 60 ($0 iklan, hanya pencarian organik), masih dalam pengujian. Terima kasih telah menggunakan layanan kami. Kami melihat pengguna yang benar-benar menyukai layanan ini, dan itu sangat memotivasi." :
                    "Hello from the operator. DAU 60 ($0 ad spend, organic search only), still in testing \u2014 writing casually. Thank you for using our service. We\u2019re seeing users who genuinely love using this service, and it\u2019s encouraging."
                  }</p>
                  <p className="text-[#8b949e]">{
                    locale === "ko" ? "\uB9BC\uD329\uD1A0\uB9AC\uB294 \uD604\uC7AC 1\uC778 \uAE30\uC5C5\uC778\uB370, 2\uC778 \uAE30\uC5C5\uC73C\uB85C \uB9CC\uB4E4\uB824\uACE0 \uD569\uB2C8\uB2E4. \uC774 \uCE74\uD14C\uACE0\uB9AC\uAC00 \uC88B\uC740 \uAC74 VC\uB098 \uD14C\uD06C\uC5C5\uACC4 \uC778\uC7AC\uB4E4\uC774 \uD55C\uC2EC\uD558\uAC8C \uBCF4\uB294 \uC601\uC5ED\uC774\uB77C \uC9C4\uC785\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uADF8\uB798\uC11C \uCE58\uC5F4\uD55C \uACBD\uC7C1\uC744 \uD53C\uD558\uACE0 \uC791\uC740 \uCE74\uD14C\uACE0\uB9AC\uB97C \uB3C5\uC810\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uADF8\uB7F0\uB370 \uC774 \uD68C\uC0AC\uB294 \uB2E4\uB978 \uBAA8\uB4E0 \uC810\uC220\uD68C\uC0AC\uC640\uB294 \uB2EC\uB9AC \uC5D4\uBE44\uB514\uC544 \uB85C\uACE0\uB97C \uC4F8 \uC218 \uC788\uB294 \uD68C\uC0AC\uC774\uACE0 \uBC31\uC11C\uAC00 \uC788\uC5B4\uC11C \uAD8C\uC704\uC758 \uD574\uC790\uAC00 \uC788\uB294 \uC2A4\uD0C0\uD2B8\uC5C5\uC73C\uB85C, \uD53C\uD130 \uD2F8\uC758 \uCCA0\uD559\uACFC \uC644\uBCBD\uD558\uAC8C \uD1B5\uD558\uB294 \uD68C\uC0AC\uC785\uB2C8\uB2E4." :
                    locale === "ja" ? "Rimfactory\u306F\u73FE\u57281\u4EBA\u4F1A\u793E\u30012\u4EBA\u306B\u3057\u305F\u3044\u3002VC\u3084\u30C8\u30C3\u30D7\u4EBA\u6750\u306F\u3053\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u8EFD\u8996\u3059\u308B\u306E\u3067\u7AF6\u4E89\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u3057\u304B\u3057\u4ED6\u306E\u5360\u3044\u4F1A\u793E\u3068\u9055\u3044\u3001NVIDIA\u30ED\u30B4\u3068\u767D\u66F8\u3092\u6301\u3064\u6A29\u5A01\u306E\u5821\u304C\u3042\u308A\u307E\u3059\u3002\u30D4\u30FC\u30BF\u30FC\u30FB\u30C6\u30A3\u30FC\u30EB\u306E\u6226\u7565\u3092\u5B9F\u884C\u4E2D\u3002" :
                    "Rimfactory is a 1-person company looking to become 2. VCs and top tech talent dismiss this category \u2014 so there\u2019s no competition. But unlike every other divination company, we carry the NVIDIA logo and a published whitepaper \u2014 an authority moat. Peter Thiel\u2019s playbook, executed."
                  }</p>
                  <p>{
                    locale === "ko" ? "\uC6D0\uD558\uB294 \uC0AC\uB78C: \uACF5\uD559\uC801 \uBCA0\uC774\uC2A4 + \uC778\uBB38\uD559\uC801 \uC9C0\uC2DD \uC0C1\uAE09 + \uC601\uC5B4 \uAC00\uB2A5 = \uC774\uBA54\uC77C \uBB38\uC758\uBC14\uB78C" :
                    locale === "ja" ? "\u6C42\u3080\u4EBA\u6750\uFF1A\u30A8\u30F3\u30B8\u30CB\u30A2\u30EA\u30F3\u30B0\u57FA\u76E4 + \u4EBA\u6587\u5B66\u7684\u77E5\u8B58 + \u82F1\u8A9E\u529B = \u30E1\u30FC\u30EB\u304F\u3060\u3055\u3044" :
                    "Looking for: engineering base + strong humanities + English fluency = email us"
                  }</p>
                  <p className="text-[#8b949e]">{
                    locale === "ko" ? "\uC0AC\uC8FC\uC11C\uBE44\uC2A4\uB294 \uC800\uD76C\uAC00 \uD480\uB824\uB294 \uBB38\uC81C\uC5D0 \uD544\uC694\uD55C \uAE30\uC220\uC77C \uBFD0 \uBAA9\uC801\uC9C0\uAC00 \uC544\uB2D9\uB2C8\uB2E4. 5\uB144 \uB4A4\uC5D0\uB294 \uC7AC\uBBF8\uC788\uB294 \uACB0\uACFC\uBB3C\uC774 \uC788\uB294 \uD68C\uC0AC\uAC00 \uB420 \uAC81\uB2C8\uB2E4. \uD2B9\uD788 1.\uC778\uB3C4 2.\uBE0C\uB77C\uC9C8 3.\uC2A4\uD398\uC778\uC5D0 \uC560\uC815\uC774 \uD07D\uB2C8\uB2E4. \uD574\uB2F9 \uAD6D\uAC00 \uBD84\uB4E4 \uC911 \uC774 \uD504\uB85C\uC81D\uD2B8\uB97C \uC810\uC220 \uCE74\uD14C\uACE0\uB9AC\uC5D0\uC11C \uC138\uACC4 1\uC704\uB85C \uB9CC\uB4E4\uACE0 \uC2F6\uC73C\uC2E0 \uBD84\uC740 \uC5F0\uB77D\uC8FC\uC138\uC694." :
                    locale === "ja" ? "\u56DB\u67F1\u63A8\u547D\u30B5\u30FC\u30D3\u30B9\u306F\u554F\u984C\u89E3\u6C7A\u306E\u305F\u3081\u306E\u6280\u8853\u3067\u3042\u308A\u76EE\u7684\u5730\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u30025\u5E74\u5F8C\u306B\u306F\u8208\u5473\u6DF1\u3044\u4F1A\u793E\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002\u7279\u306B1.\u30A4\u30F3\u30C9 2.\u30D6\u30E9\u30B8\u30EB 3.\u30B9\u30DA\u30A4\u30F3\u306B\u611B\u7740\u304C\u3042\u308A\u307E\u3059\u3002\u3053\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u5360\u3044\u30AB\u30C6\u30B4\u30EA\u30FC\u3067\u4E16\u754C1\u4F4D\u306B\u3057\u305F\u3044\u65B9\u306F\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\u3002" :
                    "Saju is the process, not the destination. In 5 years we\u2019ll have something remarkable. Special interest in India, Brazil, Spain. If you want to make this project #1 in divination \u2014 reach out."
                  }</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
