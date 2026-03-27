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
      "Yes! The full compatibility analysis — including detailed love, work, friendship, conflict resolution, and this year's forecast — is 100% free. No sign-up required, no credit card, no catch. We believe compatibility is meant to be shared. Check as many pairs as you want.",
  },
  {
    question: "How does the daily fortune work?",
    answer:
      "Once you generate a free reading and sign in, your dashboard shows a personalized daily fortune based on your Day Master element and that day's cosmic energy. It includes a fortune message, practical advice, lucky color, lucky direction, and a suggested activity — all changing every day. You also get a 7-day energy forecast. It's completely free and updates automatically.",
  },
  {
    question: "Can I generate readings for other people?",
    answer:
      "Yes! You can generate as many free readings as you want — for friends, family, partners, or anyone else. Just enter their birth details on the Calculate page. Each reading gets its own shareable link. On your dashboard, you can switch your primary chart (once per day) to see the daily fortune for different people.",
  },
  {
    question: "What is the Master Consultation?",
    answer:
      "Think of it as a personal Saju advisor session. You submit a specific life question — about career moves, relationship timing, financial decisions, or anything weighing on your mind — and receive a 2,000–4,000 word personalized analysis grounded in your unique birth chart. Each consultation examines how your Four Pillars, element balance, and current cosmic cycles relate to your specific situation, with concrete timing guidance and actionable insights.",
  },
  {
    question: "How does the consultation process work?",
    answer:
      "First, choose a topic area (career, love, timing, wealth, health, or general) and describe your question in detail. If your question would benefit from more specifics, you'll get a couple of clarifying questions to ensure a precise, relevant reading. Your full report is then generated and saved permanently to your dashboard. The whole process takes about 30–60 seconds. If anything goes wrong during generation, your credit is preserved — you won't lose a session to a technical issue.",
  },
  {
    question: "Do I need to sign in to pay?",
    answer:
      "Yes. We require Google sign-in before any purchase so your paid content is permanently saved to your account and dashboard. This also ensures you can access your readings on any device. Sign-in is free and takes one click — we only request your name and email.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay. Payments are processed securely through LemonSqueezy, a trusted payment platform. All transactions are encrypted and your payment details are never stored on our servers.",
  },
  {
    question: "How is web payment different from the app?",
    answer:
      "When you purchase through our website (sajuastrology.com), payments go through LemonSqueezy at our listed prices ($9.99 / $29.99). When we launch our iOS and Android apps, purchases through the App Store or Google Play may include platform fees set by Apple and Google (typically 15–30%), which could make in-app prices slightly higher. For the best value, we recommend purchasing through our website. Your account and all purchased content sync across web and app.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "We're building native iOS and Android apps right now — launching very soon! The apps will include push notifications for your daily fortune, offline access to your readings, and a smoother mobile experience. In the meantime, sajuastrology.com works perfectly on any mobile browser. Any purchases or readings you create on the web will automatically appear in the app when it launches.",
  },
  {
    question: "How accurate is Saju analysis?",
    answer:
      "Saju (四柱命理) is a centuries-old system rooted in the interactions of the Five Elements, Heavenly Stems, and Earthly Branches — the same framework that has guided decisions in Korean, Chinese, and East Asian cultures for over a thousand years. With the correct birth date, time, and location, Saju maps out 518,400 unique cosmic profiles — far more nuanced than Western astrology's 12 types. If you don't know your exact birth time, you can still get a reading (defaulting to noon), though it will be less precise for the hour pillar.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Since readings are generated instantly and uniquely for your birth chart, we generally cannot offer refunds on completed readings. However, if you experience a technical issue that prevents you from accessing your paid content, contact us at info@rimfactory.co.kr and we'll make it right. For consultations, unused credits remain in your account indefinitely.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Yes. Your data is stored securely and is never shared with third parties or used for any purpose other than generating your readings. We use industry-standard security practices. You can request deletion of your account and all associated data at any time by contacting us.",
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
