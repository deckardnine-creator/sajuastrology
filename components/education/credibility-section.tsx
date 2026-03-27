"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function CredibilitySection() {
  const { locale } = useLanguage()

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-gold rounded-2xl p-8 sm:p-12 text-center"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6">
            {t("wis.cred.title", locale)}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            <span className="text-primary font-medium">Saju (사주, 四柱)</span>{" "}
            {t("wis.cred.desc", locale)}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
