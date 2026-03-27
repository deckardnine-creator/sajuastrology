"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ_KEYS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
  { q: "faq.q8", a: "faq.a8" },
  { q: "faq.q9", a: "faq.a9" },
  { q: "faq.q10", a: "faq.a10" },
  { q: "faq.q11", a: "faq.a11" },
  { q: "faq.q12", a: "faq.a12" },
  { q: "faq.q13", a: "faq.a13" },
  { q: "faq.q14", a: "faq.a14" },
] as const;

export function PricingFAQ() {
  const { locale } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-20"
    >
      <h2 className="font-serif text-2xl font-semibold text-center mb-8">
        {t("faq.title", locale)}
      </h2>
      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {FAQ_KEYS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass rounded-xl px-6 border-0"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium">{t(faq.q, locale)}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {t(faq.a, locale)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  )
}
