"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const westernFeatures = [
  "12 Types",
  "Based on sun position",
  "Monthly predictions",
  "Generic advice",
]

const sajuFeatures = [
  "518,400 Types",
  "Based on full cosmic state",
  "Daily precision readings",
  "Hyper-personalized guidance",
]

export function ComparisonSection() {
  return (
    <section className="py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Why Saju Is Different
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how K-Astrology compares to traditional Western zodiac
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Western Zodiac Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-muted/50 p-8 opacity-60"
          >
            <h3 className="font-serif text-xl font-semibold mb-6 text-muted-foreground">
              Western Zodiac
            </h3>
            <ul className="space-y-4">
              {westernFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* K-Astrology (Saju) Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-8 glow-gold bg-card-elevated relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h3 className="font-serif text-xl font-semibold mb-6 text-primary">
                K-Astrology (Saju)
              </h3>
              <ul className="space-y-4">
                {sajuFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
