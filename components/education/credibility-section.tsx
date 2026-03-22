"use client"

import { motion } from "framer-motion"

export function CredibilitySection() {
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
            A Millennium of Wisdom
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            <span className="text-primary font-medium">
              Saju (사주, 四柱)
            </span>{" "}
            — also known as Four Pillars of Destiny — has been the primary
            life-guidance system in Korea, China, and Japan for over a
            millennium. Today, it&apos;s consulted for major life decisions: career
            changes, marriages, business launches, and more.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
