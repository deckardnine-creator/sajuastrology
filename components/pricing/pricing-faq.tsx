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
      "Correct. The Free Reading is completely free with no account required. The Full Destiny Reading is a one-time $9.99 payment — you pay once, and your reading is yours forever. The Master Consultation is $29.99 for 5 sessions. No recurring charges, no hidden fees.",
  },
  {
    question: "What do I get for free vs. paid?",
    answer:
      "The Free Reading gives you your Four Pillars, Day Master archetype, Five Elements balance, and a this-year overview. The $9.99 Full Destiny Reading unlocks your complete 10-year fortune cycle, detailed wealth/career/love analysis, health timing, and a permanent shareable page.",
  },
  {
    question: "What is the Master Consultation?",
    answer:
      "It's a personal AI Saju consultation service. You get 5 sessions for $29.99 ($6 each). Submit a life question — career change, relationship timing, investment decisions — and our AI analyzes it through your Saju chart. If your question needs more detail, the AI will ask follow-up questions first. Each session produces a 2,000–4,000 word personalized report, saved to your dashboard.",
  },
  {
    question: "How does the consultation process work?",
    answer:
      "1) Choose a topic and write your question. 2) If your question is broad, the AI asks clarifying questions to ensure precision. 3) Once enough context is gathered, the AI generates a detailed Saju-based report analyzing your question through your birth chart. 4) Your report is saved to your dashboard and can be revisited anytime.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit cards via Stripe, plus Apple Pay and Google Pay. In the mobile app, payments are processed through Apple App Store or Google Play Store. Your payment information is always handled securely.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Absolutely. We use bank-grade encryption (AES-256). Your birth data is never shared or sold. You can delete your account and all data at any time from your dashboard.",
  },
  {
    question: "Can I share my reading with friends?",
    answer:
      "Yes! Every reading generates a shareable card with your archetype and a teaser. Share it on social media or any messenger. Your friends can click through to get their own free reading.",
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
