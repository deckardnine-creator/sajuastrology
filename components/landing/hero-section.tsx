"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
const IOS_APP_AVAILABLE = false

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
            <h1 className="font-serif text-[1.625rem] xs:text-[1.875rem] sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] break-words">
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
            </p>

            {/* ════════════════════════════════════════════════════════
                Authority stack — NVIDIA Inception strip ABOVE the
                whitepaper button (chandler 2026-05-02 reorder).
                
                Reasoning: NVIDIA Inception is the strongest external
                validation signal a startup can show on a hero — selected
                by NVIDIA = third-party gatekeeper credential. Putting it
                first builds the "this is a real, vetted company" frame
                BEFORE the visitor encounters the whitepaper (which then
                lands as supporting technical depth, not as the lead claim).
                
                Both gated:
                  - NVIDIA strip: web-only (Apple Guideline 5.2.5 — no
                    third-party marks in native binary).
                  - Whitepaper: visible on app too (own asset, not a
                    third-party mark, so 5.2.5 does not apply).
                
                Visual language:
                  - Compact: NVIDIA strip py-2, whitepaper py-3
                  - Web: items-start (left). Mobile: items-center.
                  - gap-3 between NVIDIA and whitepaper, mirroring the
                    gap between the two primary CTAs below.
            ════════════════════════════════════════════════════════ */}
            <div className="flex flex-col items-center sm:items-start gap-3">
              {/* NVIDIA strip — web only (Apple Guideline 5.2.5: no third-
                  party marks in the native binary). Now sits at the top of
                  the authority stack. */}
              {!isNativeApp && <NvidiaInceptionStrip />}

              {/* chandler 2026-05-01 (rev): explicitly forward current locale
                  via ?lang= on click. The whitepaper page reads ?lang= first
                  in detectLocale() (language-context.tsx) and persists it,
                  so this guarantees the user lands in the same language
                  they're already viewing the site in — no race conditions
                  with localStorage hydration on a fresh tab. */}
              <Link
                href="/whitepaper"
                onClick={(e) => {
                  try {
                    e.preventDefault();
                    const lang = locale || "en";
                    window.location.href = `/whitepaper?lang=${lang}`;
                  } catch {
                    // fall through to default href
                  }
                }}
                className="group relative w-[280px] lg:w-auto lg:min-w-[280px] block"
              >
                {/* Glow halo */}
                <span
                  aria-hidden
                  className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/30 via-amber-300/40 to-amber-500/30 opacity-60 blur-md group-hover:opacity-90 transition-opacity"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl ring-1 ring-amber-300/50 group-hover:ring-amber-200/70 transition-colors"
                />
                <div className="relative rounded-xl bg-gradient-to-r from-amber-500/[0.08] via-amber-400/[0.12] to-amber-500/[0.08] backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                  {/* The 📄 emoji is in hero.whitepaperLink at the
                      translations layer. */}
                  <span className="flex-1 min-w-0 text-[13.5px] sm:text-[14px] leading-snug font-medium text-amber-100 group-hover:text-amber-50 transition-colors">
                    {t("hero.whitepaperLink")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* ════════════════════════════════════════════════════════
                  v6.18.4: LLM self-evaluation experiment badge
                  
                  Sits at the bottom of the authority stack (NVIDIA →
                  Whitepaper → LLM Experiment), visually subordinate to
                  the two academic/external-validation signals above.
                  
                  Cyan/sky tone (vs amber for Whitepaper) marks this as
                  a different category — playful experiment, not a
                  credential. Same shape language (rounded card + ring +
                  arrow) keeps the stack coherent.
                  
                  Links to /blog/llm-saju-self-evaluation, an English-only
                  static page (no Navbar, no language toggle) per chandler
                  spec — this is the only blog page reachable from home.
              ════════════════════════════════════════════════════════ */}
              <Link
                href="/blog/llm-saju-self-evaluation"
                className="group relative w-[280px] lg:w-auto lg:min-w-[280px] block"
              >
                <span
                  aria-hidden
                  className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/25 via-sky-300/35 to-cyan-500/25 opacity-50 blur-md group-hover:opacity-80 transition-opacity"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl ring-1 ring-cyan-300/40 group-hover:ring-cyan-200/60 transition-colors"
                />
                <div className="relative rounded-xl bg-gradient-to-r from-cyan-500/[0.06] via-sky-400/[0.10] to-cyan-500/[0.06] backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                  <span className="flex-1 min-w-0 text-[13.5px] sm:text-[14px] leading-snug font-medium text-cyan-100 group-hover:text-cyan-50 transition-colors">
                    {t("hero.llmExperimentBadge")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>

            {/* ════════════════════════════════════════════════════════
                v1.3 Sprint 2-B v6.9: Soram CTA + primary CTAs unified
                
                Why this used to look "off" on mobile (chandler's bug
                report, image 2): the Soram card lived OUTSIDE the
                CTA stack wrapper. The wrapper has
                `items-center sm:items-start` so on mobile the two
                primary CTAs are centered, but the Soram card —
                being a sibling of the wrapper, not a child — sat in
                the parent flex (which is flex-col with default
                stretch/start), reading as left-justified at 280px
                width. The two yellow buttons looked centered, the
                gold accent card looked detached and shoved left.
                Result: visual triplet but feels like 1 + 2 instead
                of one stack of three.
                
                Fix: move the Soram card INTO the same wrapper as
                the primary CTAs, as the FIRST child. All three are
                now inside one flex column, all 280px on mobile, all
                centered together. Reads as one cohesive triplet.
            ════════════════════════════════════════════════════════ */}
            <div className="flex flex-col items-center sm:items-start gap-3 mt-1 sm:mt-2">

              {/* chandler 2026-05-01 (rev): primary CTAs FIRST, Soram card
                  AFTER. The hero already has the whitepaper glow button +
                  NVIDIA strip carrying authority signals at the top — the
                  conversion CTAs (Reading / Compatibility) deserve the prime
                  adjacent slot. Soram is a returning-user / depth tool and
                  lives just below, still in the same stack. */}

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

              {/* Secondary: Compatibility check (free)
                  v6.17.55 — chandler 2026-05-02: outline styled to match
                  the whitepaper button above (glow halo + amber ring)
                  while keeping the existing color/border palette. The
                  goal was visual parity in *outline treatment*, not in
                  fill — so the inner Button keeps its bg-transparent +
                  EAB308 border, and the new glow + ring sit OUTSIDE on
                  the wrapping Link. group-hover wiring mirrors the
                  whitepaper button so both elements (halo opacity, ring
                  brightness, ArrowRight slide) animate together. */}
              <Link href="/compatibility" className="group relative block w-[280px] lg:w-auto">
                {/* Glow halo — same gradient as whitepaper button */}
                <span
                  aria-hidden
                  className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-amber-500/30 via-amber-300/40 to-amber-500/30 opacity-60 blur-md group-hover:opacity-90 transition-opacity pointer-events-none"
                />
                {/* Outer ring outline */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-md ring-1 ring-amber-300/50 group-hover:ring-amber-200/70 transition-colors pointer-events-none"
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="relative bg-transparent border-2 border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold text-base px-6 w-full lg:w-auto transition-all duration-200 active:scale-[0.99]"
                >
                  <span className="truncate lg:overflow-visible lg:whitespace-nowrap">{t("hero.ctaCompatibility")}</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              {/* CEO message card (chandler 2026-05-05) — placed right after the
                  free Compatibility CTA because that's the moment a user is about
                  to start the celebrity-compatibility behavior we want to
                  acknowledge. The box is intentionally collapsed by default
                  (Read more) so it doesn't dominate the hero on first paint;
                  expanding it surfaces the full founder voice.

                  Wikipedia link is locale-aware (KO/JA → native Wikipedia,
                  others → English Wikipedia Special:Search). Text wraps with
                  whitespace-pre-line so \n in the i18n string preserves
                  paragraph breaks. */}
              <details className="group relative w-[280px] lg:w-[420px] rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/5 to-transparent open:bg-amber-500/[0.06] transition-colors">
                <div className="absolute inset-y-0 left-0 w-1 bg-amber-400/60 rounded-l-xl" />
                <summary className="cursor-pointer list-none p-3 sm:p-4 pl-5 select-none">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] sm:text-[14px] font-semibold text-amber-100/90 leading-snug">
                        {t("hero.ceoMsgTitle")}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-300/70 shrink-0 transition-transform group-open:rotate-90" />
                  </div>
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-5 pt-1">
                  <p className="whitespace-pre-line text-[12.5px] sm:text-[13px] text-amber-100/85 leading-relaxed break-keep">
                    {t("hero.ceoMsgBody")}
                  </p>
                  <a
                    href={
                      locale === "ko"
                        ? "https://ko.wikipedia.org/wiki/%ED%8A%B9%EC%88%98:%EA%B2%80%EC%83%89"
                        : locale === "ja"
                        ? "https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:%E6%A4%9C%E7%B4%A2"
                        : "https://en.wikipedia.org/wiki/Special:Search"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-[12.5px] sm:text-[13px] font-semibold text-amber-300 hover:text-amber-200 underline decoration-amber-400/40 underline-offset-4 hover:decoration-amber-200/70 transition-colors"
                  >
                    {t("hero.ceoMsgLink")}
                  </a>
                  <div className="mt-3 text-[11px] text-amber-200/50 text-right tracking-wide">
                    {t("hero.ceoMsgSignature")}
                  </div>
                </div>
              </details>

              {/* Soram CTA card — moved BELOW the primary CTAs (chandler rev) */}
              <button
                onClick={handleSoramClick}
                className="group relative w-[280px] lg:w-auto lg:min-w-[280px] text-left rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 to-amber-700/5 p-3 sm:p-4 hover:border-amber-300/60 hover:from-amber-500/15 hover:to-amber-700/10 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(234,179,8,0.2)] active:scale-[0.99]"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-amber-400/70 rounded-l-xl" />
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-amber-100">
                      {t("hero.askSoram")}
                    </div>
                    <p className="text-[12px] text-amber-200/70 mt-0.5 leading-snug">
                      {t("hero.askSoramSub")}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
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

                {/* App Store (Released) — temporarily disabled during v1.3.8 review.
                    See IOS_APP_AVAILABLE constant at top of file. */}
                {IOS_APP_AVAILABLE ? (
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
                ) : (
                  <div
                    aria-disabled="true"
                    title={t("hero.iosUpdating")}
                    className="relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed w-full sm:w-auto"
                  >
                    <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="text-sm text-white/60 font-medium leading-tight">{t("hero.appStore")}</span>
                  </div>
                )}
              </div>

              {/* iOS update notice — only visible while iOS button is disabled */}
              {!IOS_APP_AVAILABLE && (
                <p className="text-[11px] text-amber-200/70 mt-0.5 text-center sm:text-left">
                  ✨ {t("hero.iosUpdating")}
                </p>
              )}
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
              {/* Letter (CEO message) link — centered on mobile.
                  Celebrity link removed (chandler 2026-05-01) — replaced by
                  the whitepaper glow button above the NVIDIA strip. */}
              <Link
                href="/letter"
                className="text-[13px] sm:text-[14px] text-muted-foreground/85 hover:text-primary transition-colors inline-flex items-center gap-1.5 self-center sm:self-start"
              >
                <span>
                  {t("hero.letterLink")}
                </span>
              </Link>
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
