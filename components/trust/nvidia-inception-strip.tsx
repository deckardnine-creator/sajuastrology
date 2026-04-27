"use client"

// ═══════════════════════════════════════════════════════════════════
// NVIDIA Inception Trust Strip
// ─────────────────────────────────────────────────────────────────
// Displays the official NVIDIA Inception member badge with a short
// "Recognized AI Startup · April 2026" tagline. Lives in the hero
// area below the headline so the user sees it before submitting
// their birth data — the trust signal lands right in the moment of
// hesitation.
//
// Brand compliance (per NVIDIA Inception Brand Guidelines, 2026):
// • Uses the OFFICIAL Inception member badge SVG (no NVIDIA master logo)
// • Badge colors / proportions / text NEVER altered (rendered as <img>)
// • Minimum digital size 30px — we render at 36–44px depending on viewport
// • Clear space respected via px-4 py-2.5 padding on the wrapping card
// • The Rimfactory site logo (Navbar) remains visually larger than the badge
// • Links to the public NVIDIA Startups page so visitors can verify
//
// Renders on both mobile and desktop. The card sits inline with
// the rest of the hero copy.
// ═══════════════════════════════════════════════════════════════════

import { useLanguage } from "@/lib/language-context"

export function NvidiaInceptionStrip() {
  const { t } = useLanguage()

  return (
    <div className="flex justify-center my-5 sm:my-6">
      <a
        href="https://www.nvidia.com/en-us/startups/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Member of NVIDIA Inception"
        className="
          inline-flex items-center gap-3 sm:gap-4
          px-4 sm:px-5 py-2.5 sm:py-3
          rounded-2xl
          bg-white/95
          shadow-lg shadow-purple-900/30
          border border-white/40
          hover:bg-white hover:shadow-purple-900/40
          transition-all duration-200
          group
          max-w-[92vw]
        "
      >
        {/* Official NVIDIA Inception member badge — do not alter */}
        <img
          src="/badges/nvidia/inception.svg"
          alt="NVIDIA Inception Program Member"
          className="h-9 sm:h-10 w-auto shrink-0"
          width="93"
          height="40"
        />

        {/* Vertical divider — hidden on the smallest screens to save width */}
        <div className="hidden xs:block w-px h-9 sm:h-10 bg-gray-300/80 shrink-0" />

        {/* Title + date stack */}
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate">
            {t("trust.nvidiaInception")}
          </span>
          <span className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
            {t("trust.nvidiaInceptionDate")}
          </span>
        </div>
      </a>
    </div>
  )
}
