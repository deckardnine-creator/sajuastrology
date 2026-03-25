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
      "None at all. The Free Reading is completely free — no account needed, no credit card. The Full Destiny Reading is a one-time $9.99 payment, and your reading page is permanent. The Master Consultation is $29.99 for 5 sessions. Once you pay, you own it. No recurring charges, no auto-renewal, no hidden fees.",
  },
  {
    question: "What do I get for free vs. paid?",
    answer:
      "The Free Reading decodes your Four Pillars (사주팔자), reveals your Day Master archetype, shows your Five Elements balance chart, and gives you a snapshot of this year's fortune — plus a shareable cosmic profile card. The $9.99 Full Destiny Reading unlocks everything: a detailed 10-year fortune cycle (대운) analysis, wealth and career blueprint, love and relationship insights, health timing guidance, a monthly energy calendar, and a permanent reading page that's yours forever.",
  },
  {
    question: "What is the Master Consultation?",
    answer:
      "Think of it as a personal Saju advisor session. You submit a specific life question — about career moves, relationship timing, financial decisions, or anything weighing on your mind — and receive a 2,000–4,000 word personalized analysis grounded in your unique birth chart. Each reading examines how your Four Pillars, element balance, and current cosmic cycles relate to your specific situation, with concrete timing guidance and actionable insights.",
  },
  {
    question: "How does the consultation process work?",
    answer:
      "It's straightforward. First, choose a topic area and describe your question in detail. If your question would benefit from more specifics, you'll get a couple of clarifying questions to help narrow the focus — this ensures a precise, relevant reading rather than generic advice. Once enough context is gathered, your full report is generated and saved to your dashboard. You can revisit it anytime.",
  },
  {
    question: "How accurate is Saju analysis?",
    answer:
      "Saju (四柱命理) is a centuries-old system rooted in the interactions of the Five Elements, Heavenly Stems, and Earthly Branches — the same framework that has guided decisions in Korean, Chinese, and East Asian cultures for over a thousand years. The accuracy of your reading depends on the precision of your birth data. With the correct birth date, time, and location, Saju maps out 518,400 unique cosmic profiles — far more nuanced than Western astrology's 12 types.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex) processed securely through Stripe. Apple Pay and Google Pay are also available. All transactions are encrypted and your payment details are never stored on our servers.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Yes. Your birth data is encrypted with AES-256 and is never shared with third parties or used for any purpose other than generating your readings. You have full control — you can delete your account and all associated data at any time from your dashboard settings.",
  },
  {
    question: "Can I share my reading with friends?",
    answer:
      "Absolutely. Every reading comes with a shareable cosmic profile card featuring your archetype and a preview. Share it anywhere — social media, messaging apps, or email. When your friends click through, they can discover their own Four Pillars with a free reading.",
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
