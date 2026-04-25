"use client"

// ════════════════════════════════════════════════════════════════════
// /pricing/soram-companion — placeholder for $4.99/mo Soram Companion
// ════════════════════════════════════════════════════════════════════
// Subscription billing for Soram Companion is not yet wired up. Until
// it ships, this page invites the user to keep using the free 1-per-day
// Soram tier and bookmark the page for return.
// ════════════════════════════════════════════════════════════════════

import { useEffect } from "react"
import Link from "next/link"
import { MessageCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { track, Events } from "@/lib/analytics"

export default function SoramCompanionPage() {
  const { locale } = useLanguage()

  useEffect(() => {
    try {
      track(Events.pricing_cta_clicked, {
        plan: "soram-companion-placeholder",
        landed_on_placeholder: true,
      })
    } catch {}
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/12 blur-[140px]" />
      </div>

      <Navbar />

      <section className="pt-20 sm:pt-28 pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center">
            {/* Soram avatar circle */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 mb-6 overflow-hidden shadow-lg shadow-amber-500/30">
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-2xl">🌙</span>
              <img
                src="/soram/soram_nav.webp"
                alt=""
                aria-hidden="true"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = "none"
                }}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              {t("pc.companion.name", locale)}
            </h1>
            <div className="inline-block px-3 py-1 mb-5 text-xs uppercase tracking-wide bg-amber-500/15 text-amber-300/90 border border-amber-500/30 rounded-full">
              {t("pricing.comingSoon", locale)}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {locale === "ko" && "\uc18c\ub78c \ub3d9\ud589 \uad6c\ub3c5\uc774 \uacf3 \uc5f4\ub9bd\ub2c8\ub2e4. \uadf8 \uc804\uae4c\uc9c0\ub294 \ud558\ub8e8 1\ud68c \ubb34\ub8cc\ub85c \uc18c\ub78c\uacfc \ub300\ud654\ud574\ubcf4\uc138\uc694 \u2014 \uadf8\ub300\uc758 \uc0ac\uc8fc\ub97c \uc774\ubbf8 \uae30\uc5b5\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4."}
              {locale === "ja" && "\u30bd\u30e9\u30e0\u540c\u884c\u306e\u30b5\u30d6\u30b9\u30af\u306f\u8fd1\u65e5\u958b\u59cb\u3055\u308c\u307e\u3059\u3002\u305d\u308c\u307e\u3067\u306f1\u65e51\u56de\u7121\u6599\u3067\u30bd\u30e9\u30e0\u3068\u4f1a\u8a71\u3092\u304a\u697d\u3057\u307f\u304f\u3060\u3055\u3044 \u2014 \u3042\u306a\u305f\u306e\u56db\u67f1\u3092\u3059\u3067\u306b\u8a18\u61b6\u3057\u3066\u3044\u307e\u3059\u3002"}
              {locale === "en" && "Soram Companion subscription is opening soon. Until then, chat with Soram once a day for free — Soram already remembers your saju."}
              {!["ko", "ja", "en"].includes(locale) && "Soram Companion subscription is opening soon. Until then, chat with Soram once a day for free — Soram already remembers your saju."}
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/soram" className="block">
                <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {locale === "ko" ? "\uc18c\ub78c\uc5d0\uac8c \ubb3b\uae30 (\ubb34\ub8cc 1\ud68c)" : locale === "ja" ? "\u30bd\u30e9\u30e0\u306b\u805e\u304f (\u7121\u65991\u56de)" : "Ask Soram (1 free)"}
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
