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
      "None at all. The Free tier is completely free — no credit card needed. The Full Destiny Reading is a one-time $9.99 payment, and your reading page is permanent. The Master Consultation is $29.99 for 5 sessions. Once you pay, you own it. No recurring charges, no auto-renewal, no hidden fees.",
  },
  {
    question: "What do I get for free vs. paid?",
    answer:
      "Free includes: your Four Pillars decoded, Day Master archetype, Five Elements balance chart, this year's fortune overview, a personalized daily fortune, and full detailed compatibility analysis (love, work, friendship, conflict resolution, and yearly forecast). The $9.99 Full Destiny Reading adds: a deep 10-year fortune cycle, career and wealth blueprint, love and relationship patterns, health timing guidance, monthly energy calendar, and hidden talent analysis — all on a permanent page that's yours forever.",
  },
  {
    question: "Is compatibility really completely free?",
    answer:
      "Yes! The full compatibility analysis — including detailed love, work, friendship, conflict resolution, and this year's forecast — is 100% free. No sign-up required, no credit card, no catch. Check as many pairs as you want. Sign in to save results to your dashboard.",
  },
  {
    question: "What languages are supported?",
    answer:
      "SajuAstrology is available in English, Korean (한국어), and Japanese (日本語). The interface and AI-generated readings are fully localized in all three languages. You can switch languages anytime from the menu.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Yes! SajuAstrology is available on both iOS (App Store) and Android (Google Play). The app includes push notifications for your daily fortune, offline access to your readings, and a seamless mobile experience. Your account and all purchased content sync automatically between web and app.",
  },
  {
    question: "How is web payment different from the app?",
    answer:
      "When you purchase through our website (sajuastrology.com), payments go through our secure payment processor at our listed prices ($9.99 / $29.99). In-app purchases through the App Store or Google Play may include platform fees set by Apple and Google (typically 15–30%), which could make in-app prices slightly higher. For the best value, we recommend purchasing through our website.",
  },
  {
    question: "Do I need to sign in to pay?",
    answer:
      "Yes. We require Google sign-in before any purchase so your paid content is permanently saved to your account and accessible from your dashboard on any device. Sign-in is free and takes one click.",
  },
  {
    question: "How does the daily fortune work?",
    answer:
      "Once you generate a free reading and sign in, your dashboard shows a personalized daily fortune based on your Day Master element and that day's cosmic energy. It includes a fortune message, practical advice, lucky color, lucky direction, and a suggested activity — all changing every day. Completely free.",
  },
  {
    question: "Can I generate readings for other people?",
    answer:
      "Yes! Generate as many free readings as you want — for friends, family, partners, or anyone. Each reading gets its own shareable link. On your dashboard, you can switch your primary chart once per day to see the daily fortune for different people.",
  },
  {
    question: "What is the Master Consultation?",
    answer:
      "A personal Saju advisor session. Submit a life question — career, love, timing, wealth, health — and receive a 2,000–4,000 word personalized analysis grounded in your birth chart, with concrete timing guidance and actionable insights. 5 sessions for $29.99.",
  },
  {
    question: "How accurate is Saju analysis?",
    answer:
      "Saju (四柱命理) maps 518,400 unique cosmic profiles based on the interactions of Five Elements, Heavenly Stems, and Earthly Branches — far more nuanced than Western astrology's 12 types. The same framework has guided decisions in East Asian cultures for over a thousand years.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay. All transactions are encrypted and your payment details are never stored on our servers.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Since readings are generated instantly and uniquely for your birth chart, we generally cannot offer refunds on completed readings. For technical issues, contact info@rimfactory.co.kr within 7 days. Unused consultation credits remain in your account indefinitely.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Yes. Your data is stored securely and never shared with third parties. We use industry-standard encryption and security. Request deletion anytime by contacting us.",
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
