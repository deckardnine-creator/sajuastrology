"use client"

import { motion } from "framer-motion"
import { Target, Layers, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function WhyDifferent() {
  const { locale } = useLanguage()

  const differences = [
    { icon: Target, title: t("wis.diff.1.title", locale), description: t("wis.diff.1.desc", locale) },
    { icon: Layers, title: t("wis.diff.2.title", locale), description: t("wis.diff.2.desc", locale) },
    { icon: Clock,  title: t("wis.diff.3.title", locale), description: t("wis.diff.3.desc", locale) },
  ]

  return (
    <section className="py-24 bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            {t("wis.diff.title", locale)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("wis.diff.desc", locale)}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {differences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-gold rounded-2xl p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
