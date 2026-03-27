"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function ComparisonHook() {
  const { locale } = useLanguage()

  return (
    <section className="py-20 bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-balance">
            {t("wis.hook.title1", locale)}{" "}
            <span className="text-primary">{t("wis.hook.title2", locale)}</span>{" "}
            {t("wis.hook.title3", locale)}{" "}
            <span className="text-primary">{t("wis.hook.title4", locale)}</span>{" "}
            {t("wis.hook.title5", locale)}
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Western Zodiac */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-muted/30 p-8 opacity-60"
          >
            <h3 className="text-center text-muted-foreground mb-6 text-sm uppercase tracking-wider">
              {t("wis.hook.western", locale)}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                >
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Saju Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl glow-gold bg-card-elevated p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <div className="relative">
              <h3 className="text-center text-primary mb-6 text-sm uppercase tracking-wider font-medium">
                {t("wis.hook.saju", locale)}
              </h3>
              <div className="grid grid-cols-8 gap-1">
                {[...Array(64)].map((_, i) => {
                  const colors = [
                    "bg-secondary/60",
                    "bg-fire/60",
                    "bg-primary/60",
                    "bg-metal/60",
                    "bg-water/60",
                  ]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                      }}
                      className={`aspect-square rounded ${
                        colors[Math.floor(Math.random() * colors.length)]
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
