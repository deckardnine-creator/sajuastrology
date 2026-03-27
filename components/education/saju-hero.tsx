"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function SajuHero() {
  const { locale } = useLanguage()

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0 ? "bg-primary/40" : "bg-secondary/30"
            }`}
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              y: [null, "-30%"],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
        >
          {t("wis.hero.titleMain", locale)}{" "}
          <span className="gold-gradient-text">{t("wis.hero.titleGold", locale)}</span>
          {t("wis.hero.titleSuffix", locale)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          {t("wis.hero.desc", locale)}
        </motion.p>
      </div>
    </section>
  )
}
