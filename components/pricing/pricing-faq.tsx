"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, cancel instantly from Settings. No questions asked. Your access continues until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit cards and PayPal via Stripe. We also support Apple Pay and Google Pay for convenience.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Absolutely. We use bank-grade encryption (AES-256). Your data is never shared or sold. You can delete your account and all data at any time.",
  },
  {
    question: "What's Oracle Chat?",
    answer:
      "It's like having a personal Saju master available 24/7. Ask about career timing, relationship decisions, or any life question. Our AI combines traditional Saju wisdom with modern analysis for personalized guidance.",
  },
]

export function PricingFAQ() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-20"
    >
      <h2 className="font-serif text-2xl font-semibold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass rounded-xl px-6 border-0"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  )
}
