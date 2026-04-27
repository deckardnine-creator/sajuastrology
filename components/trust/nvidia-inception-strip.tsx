"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip — v2 (matches Soram CTA card style)
// ─────────────────────────────────────────────────────────────────
// Visually mirrors the Soram CTA card directly below it:
//   • Same w-[280px] / lg:w-auto sizing
//   • Same rounded-xl, gradient bg, left accent bar
//   • Same horizontal layout (badge + text + arrow)
// But uses a BLUE/CYAN palette instead of amber so it reads as a
// trust signal, not a conversion CTA.
//
// Lives INSIDE the same flex column wrapper as the Soram + saju + 
// compatibility CTAs — so on desktop it left-aligns with them,
// on mobile it centers within the wrapper (items-center sm:items-start).
//
// Brand compliance (NVIDIA Inception Brand Guidelines):
//   • Official Inception member badge SVG, never recolored/distorted
//   • Badge sits inside a small white pill so the white-canvas badge
//     reads cleanly against the dark hero bg without altering the
//     badge artwork itself
//   • Min digital size 30px — pill clear space + h-5 badge yields ~30px
//   • Rimfactory navbar logo remains larger than this badge
//   • External link to nvidia.com/startups for verification
// ═══════════════════════════════════════════════════════════════════

import { useLanguage } from "@/lib/language-context"
import { ArrowRight } from "lucide-react"

export function NvidiaInceptionStrip() {
  const { t } = useLanguage()

  return (
    <a
      href="https://www.nvidia.com/en-us/startups/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Member of NVIDIA Inception"
      className="block text-left w-[280px] lg:w-auto group"
    >
      <div
        className="
          relative overflow-hidden rounded-xl
          border border-sky-400/40
          bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-transparent
          backdrop-blur-sm
          pl-3.5 pr-3 py-2.5
          transition-all duration-200
          hover:border-sky-300/70
          hover:shadow-[0_8px_24px_rgba(56,189,248,0.25)]
          active:scale-[0.99]
        "
      >
        {/* Cyan/sky left accent bar — mirrors the gold bar on the Soram card */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-sky-300 to-cyan-500"
        />

        <div className="flex items-center gap-2.5">
          {/* Official NVIDIA Inception badge wrapped in a small white pill —
              the pill is the "card surface" that prevents the white-canvas
              badge from clashing with the dark bg. The badge itself stays
              brand-pure (not recolored, not distorted). */}
          <span className="shrink-0 inline-flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 ring-1 ring-white/40">
            <img
              src="/badges/nvidia/inception.svg"
              alt="NVIDIA Inception Program Member"
              className="h-5 w-auto"
              width="58"
              height="20"
            />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sky-100 leading-tight">
              {t("trust.nvidiaInception")}
            </p>
            <p className="text-[10px] text-sky-200/70 leading-snug mt-0.5">
              {t("trust.nvidiaInceptionDate")}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-sky-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  )
}
