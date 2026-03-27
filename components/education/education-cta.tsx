"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function EducationCTA() {
  const { locale } = useLanguage()

  return (
    <section className="py-24 bg-card">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
            {t("wis.cta.title", locale)}
          </h2>
          <Link href="/calculate">
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground font-semibold text-lg px-8 group"
            >
              {t("wis.cta.btn", locale)}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
