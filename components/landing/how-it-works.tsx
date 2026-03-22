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
    <section className="relative py-24 overflow-hidden">

      {/* === Teal / blue water-wisdom orbs === */}
      <motion.div
        animate={{ y: [0, -35, 0], x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
