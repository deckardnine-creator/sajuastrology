"use client"

import { motion } from "framer-motion"
import { Calendar, Columns3, ScrollText } from "lucide-react"

const steps = [
  {
    icon: Calendar,
    title: "Enter Your Birth Moment",
    description:
      "Your exact date, time, and city of birth. We calculate True Solar Time for precision.",
  },
  {
    icon: Columns3,
    title: "Decode Your Four Pillars",
    description:
      "Our engine maps the cosmic energy state at your birth into 8 characters across 4 pillars.",
  },
  {
    icon: ScrollText,
    title: "Receive Your Cosmic Blueprint",
    description:
      "Get a hyper-personalized analysis of your personality, career path, love life, and fortune cycles.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to unlock your cosmic blueprint
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-gold rounded-2xl p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm text-primary font-medium mb-2">
                Step {index + 1}
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
