"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip — v4
// ─────────────────────────────────────────────────────────────────
// Two-row card layout:
//   Row 1: Official NVIDIA Inception badge displayed at ~2/3 of the
//          card width with NO additional white wrapper. The badge
//          SVG is already a clean white rectangle with a black
//          stroke, NVIDIA Green eye logo, and the "Inception Program"
//          wordmark — wrapping it in another white pill was redundant
//          and made the badge feel small and over-protected. Now it
//          stands on its own with proper presence.
//   Row 2: Title + subtitle on the left, arrow on the right.
//
// Card uses cyan/sky palette so it reads as a trust signal rather
// than a conversion CTA. Lives inside the same flex column wrapper
// as the Soram + saju + compatibility CTAs so the visual rhythm
// (w-[280px] / lg:w-auto, rounded-xl, accent-bar pattern) matches.
//
// HIDDEN in the native app via {!isNativeApp && ...} in the parent
// hero — see hero-section.tsx for the gating logic.
//
// Brand compliance (NVIDIA Inception Brand Guidelines):
//   • Official Inception member badge SVG, never recolored/distorted
//   • Badge displayed at native aspect ratio (h-12 with w-auto on a
//     500x216 viewBox SVG yields a comfortable wide presence ≥ 30px)
//   • Clear space respected via the card's px-3.5 padding plus inner
//     mb-2 spacing between the badge row and the text row
//   • Rimfactory navbar logo remains visually larger than this badge
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
      aria-label="Selected by NVIDIA Inception"
      className="block text-left w-[280px] lg:w-auto group"
    >
      <div
        className="
          relative overflow-hidden rounded-xl
          border border-sky-400/40
          bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-transparent
          backdrop-blur-sm
          pl-3.5 pr-3 py-3
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

        {/* ─── Row 1: NVIDIA badge — sits naked on its own native white rectangle,
            sized to occupy ~2/3 of the card width for proper presence ─── */}
        <div className="flex justify-center mb-2.5">
          <img
            src="/badges/nvidia/inception.svg"
            alt="NVIDIA Inception Program Member"
            className="h-16 sm:h-20 w-auto"
            width="185"
            height="80"
          />
        </div>

        {/* ─── Row 2: Title + subtitle (left) + arrow (right) ─── */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sky-100 leading-tight">
              {t("trust.nvidiaInception")}
            </p>
            <p className="text-[10px] text-sky-200/70 leading-snug mt-0.5 truncate">
              {t("trust.nvidiaInceptionDate")}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-300/80 shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  )
}
