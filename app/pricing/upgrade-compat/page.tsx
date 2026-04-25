"use client"

// ════════════════════════════════════════════════════════════════════
// /pricing/upgrade-compat — placeholder page for $2.99 Compatibility Full
// ════════════════════════════════════════════════════════════════════
// Per chandler v6.4: payment integration for the new $2.99 Compatibility
// Full tier is not yet wired up. Rather than 404, surface a friendly
// "coming soon" page that:
//   1. Confirms the user landed on the right intent (they clicked
//      "Get Full Compatibility" on /pricing).
//   2. Offers an immediate alternative — go check free compatibility
//      now, or browse the full pricing page again.
//   3. Captures a Mixpanel event so we can measure demand for this tier.
// ════════════════════════════════════════════════════════════════════

import { useEffect } from "react"
import Link from "next/link"
import { Heart, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { track, Events } from "@/lib/analytics"

export default function UpgradeCompatPage() {
  const { locale } = useLanguage()

  useEffect(() => {
    try {
      track(Events.pricing_cta_clicked, {
        plan: "compat-full-placeholder",
        landed_on_placeholder: true,
      })
    } catch {}
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-pink-500/10 blur-[140px]" />
      </div>

      <Navbar />

      <section className="pt-20 sm:pt-28 pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-400/30 mb-6">
              <Heart className="w-8 h-8 text-pink-300" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              {t("pc.compat.name", locale)}
            </h1>
            <div className="inline-block px-3 py-1 mb-5 text-xs uppercase tracking-wide bg-amber-500/15 text-amber-300/90 border border-amber-500/30 rounded-full">
              {t("pricing.comingSoon", locale)}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {locale === "ko" && "\ud480 \uad81\ud569 \uacb0\uc81c\uac00 \uacf3 \uc5f4\ub9bd\ub2c8\ub2e4. \uc77c\ub2e8\uc740 \ubb34\ub8cc \uad81\ud569 \ubd84\uc11d\uc744 \ub9c8\uc74c\uaecf \ub9db\ubcf4\uc138\uc694 \u2014 \uc5f0\uc560, \uc9c1\uc7a5, \uc6b0\uc815, \uc774\ubc88 \ud574\uc758 \ud750\ub984\uae4c\uc9c0 \ubaa8\ub450 \ub2f4\uaca8 \uc788\uc2b5\ub2c8\ub2e4."}
              {locale === "ja" && "\u30d5\u30eb\u76f8\u6027\u306e\u8cfc\u5165\u306f\u8fd1\u65e5\u516c\u958b\u3055\u308c\u307e\u3059\u3002\u307e\u305a\u306f\u7121\u6599\u76f8\u6027\u5206\u6790\u3092\u3054\u81ea\u7531\u306b\u3054\u5229\u7528\u304f\u3060\u3055\u3044 \u2014 \u604b\u611b\u3001\u4ed5\u4e8b\u3001\u53cb\u60c5\u3001\u4eca\u5e74\u306e\u6d41\u308c\u307e\u3067\u3059\u3079\u3066\u542b\u307e\u308c\u3066\u3044\u307e\u3059\u3002"}
              {locale === "en" && "Compatibility Full purchase is opening soon. For now, enjoy the free compatibility analysis to your heart's content — love, work, friendship, and this year's flow are all included."}
              {!["ko", "ja", "en"].includes(locale) && "Compatibility Full purchase is opening soon. For now, enjoy the free compatibility analysis to your heart's content — love, work, friendship, and this year's flow are all included."}
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/compatibility" className="block">
                <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold">
                  <Heart className="w-4 h-4 mr-2" />
                  {locale === "ko" ? "\ubb34\ub8cc \uad81\ud569 \ubcf4\ub7ec\uac00\uae30" : locale === "ja" ? "\u7121\u6599\u76f8\u6027\u3092\u898b\u308b" : "Try Free Compatibility"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing" className="block">
                <Button variant="outline" className="w-full h-11 text-sm">
                  <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                  {locale === "ko" ? "\uc694\uae08\uc81c\ub85c \ub3cc\uc544\uac00\uae30" : locale === "ja" ? "\u6599\u91d1\u30d7\u30e9\u30f3\u306b\u623b\u308b" : "Back to Pricing"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
