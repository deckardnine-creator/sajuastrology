"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function ComparisonSection() {
  const { locale } = useLanguage()

  const westernFeatures = [
    t("comp.western1", locale),
    t("comp.western2", locale),
    t("comp.western3", locale),
    t("comp.western4", locale),
    t("comp.western5", locale),
  ]

  const sajuFeatures = [
    t("comp.saju1", locale),
    t("comp.saju2", locale),
    t("comp.saju3", locale),
    t("comp.saju4", locale),
    t("comp.saju5", locale),
  ]

  return (
    <section className="relative py-24 bg-card overflow-hidden">

      {/* === Violet / rose contrast orbs === */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-1/4 w-[450px] h-[450px] rounded-full bg-violet-600/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full bg-yellow-500/10 blur-[100px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            {t("comp.title", locale)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("comp.desc", locale)}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Western Zodiac Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-muted/50 p-8 opacity-60"
          >
            <h3 className="font-serif text-xl font-semibold mb-6 text-muted-foreground">
              {t("comp.western", locale)}
            </h3>
            <ul className="space-y-4">
              {westernFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* K-Astrology (Saju) Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-8 glow-gold bg-card-elevated relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h3 className="font-serif text-xl font-semibold mb-6 text-primary">
                {t("comp.saju", locale)}
              </h3>
              <ul className="space-y-4">
                {sajuFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
