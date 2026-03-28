"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export default function PricingPage() {
  const { locale } = useLanguage()

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Gold / cosmic pricing glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-yellow-500/15 blur-[140px]" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-amber-600/12 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-purple-700/15 blur-[130px]" />
      </div>

      <Navbar />
      <section className="pt-24 sm:pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              {t("pricing.titleMain", locale)}{" "}
              <span className="gold-gradient-text">{t("pricing.titleGold", locale)}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.subtitle", locale)}
            </p>
          </div>
          <PricingCards />
          <PricingFAQ />
        </div>
      </section>
      <Footer />
    </main>
  )
}
