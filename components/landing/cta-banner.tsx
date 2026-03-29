"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function CTABanner() {
  const { locale } = useLanguage()

  return (
    <section className="relative py-24 overflow-hidden">

      {/* === Warm gold / amber CTA orbs === */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-yellow-400/15 blur-[120px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="gold-gradient rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
              {t("cta.title", locale)}
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/70 mb-6">
              {locale === "ko"
                ? "2,000년 고전 원전에 근거한 당신만의 분석"
                : locale === "ja"
                ? "2,000年の古典原典に基づくあなただけの分析"
                : "Grounded in 2,000 years of classical texts"}
            </p>
            <Link href="/calculate">
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 font-semibold text-lg px-8"
              >
                {t("cta.btn", locale)}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
