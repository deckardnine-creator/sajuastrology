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
    question: "Is there really no subscription?",
    answer:
      "Correct. The Free Reading is completely free with no account required. The Full Destiny Reading is a one-time $9.99 payment — you pay once, and your reading is yours forever. No recurring charges, no hidden fees.",
  },
  {
    question: "What do I get for free vs. paid?",
    answer:
      "The Free Reading gives you your Four Pillars, Day Master archetype, Five Elements balance, and a this-year overview. The $9.99 Full Destiny Reading unlocks your complete 10-year fortune cycle, detailed wealth/career/love analysis, health timing, and a permanent shareable page.",
  },
  {
    question: "What is the Master Consultation?",
    answer:
      "It's a personalized, in-depth analysis of a specific life question — like a career change, relationship decision, or major life move. You submit your question, and within 24 hours you receive a 3,000–5,000 word Saju-based consultation delivered to your dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit cards via Stripe, plus Apple Pay and Google Pay. Your payment information is handled securely by Stripe — we never see or store your card details.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Absolutely. We use bank-grade encryption (AES-256). Your birth data is never shared or sold. You can delete your account and all data at any time from your dashboard.",
  },
  {
    question: "Can I share my reading with friends?",
    answer:
      "Yes! Every reading generates a shareable card with your archetype and a teaser. Share it on Facebook, Twitter, Reddit, or any messenger. Your friends can click through to get their own free reading.",
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
