"use client"

import { motion } from "framer-motion"

const stats = [
  { value: "2.3M+", label: "Readings Delivered" },
  { value: "194", label: "Countries" },
  { value: "4.8", label: "Average Rating", suffix: "★" },
]

export function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass py-6"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-primary font-semibold text-lg sm:text-xl">
                {stat.value}
                {stat.suffix && (
                  <span className="text-primary">{stat.suffix}</span>
                )}
              </span>
              <span className="text-muted-foreground text-sm uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
