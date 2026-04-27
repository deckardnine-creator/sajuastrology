"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip — v3 (two-row layout)
// ─────────────────────────────────────────────────────────────────
// Two-row card layout per chandler's spec:
//   Row 1: NVIDIA Inception badge displayed wide and prominent
//          on a clean white pill (badge stays brand-pure, never
//          recolored or distorted).
//   Row 2: Title + subtitle on the left, arrow on the right.
//
// Card lives INSIDE the same flex column wrapper as the Soram +
// saju + compatibility CTAs — same w-[280px] / lg:w-auto sizing,
// same rounded-xl, same accent-bar pattern. Cyan/sky palette so
// it reads as a trust signal rather than a conversion CTA.
//
// Brand compliance (NVIDIA Inception Brand Guidelines):
//   • Official Inception member badge SVG, never recolored
//   • Badge sits on a white pill with respectful clear space
//   • h-7 (28px) wide-display badge ≥ minimum 30px (with pill padding)
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

        {/* ─── Row 1: NVIDIA badge displayed wide on a white pill ─── */}
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center justify-center rounded-md bg-white px-2 py-1 ring-1 ring-white/40">
            <img
              src="/badges/nvidia/inception.svg"
              alt="NVIDIA Inception Program Member"
              className="h-6 w-auto"
              width="70"
              height="24"
            />
          </span>
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
