"use client"

import { motion } from "framer-motion"
import { Gauge, TrendingUp, Heart, Sparkles } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Daily Destiny Score",
    description:
      "Your personalized energy forecast, updated every day.",
  },
  {
    icon: TrendingUp,
    title: "Wealth & Career Blueprint",
    description:
      "10-year financial cycle analysis based on your elemental balance.",
  },
  {
    icon: Heart,
    title: "Love Synergy",
    description:
      "Deep compatibility analysis. Not just signs — full elemental harmony mapping.",
  },
  {
    icon: Sparkles,
    title: "Oracle Chat",
    description:
      "Ask anything about your path. AI-powered, rooted in 1,000 years of wisdom.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">

      {/* === Five-element themed orbs === */}
      {/* Wood — green, top left */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-green-600/20 blur-[120px] pointer-events-none"
      />
      {/* Fire — red/orange, top right */}
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none"
      />
      {/* Earth — gold, center */}
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none"
      />
      {/* Metal — cyan/silver, bottom right */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-cyan-400/15 blur-[110px] pointer-events-none"
      />
      {/* Water — deep blue, bottom left */}
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-700/20 blur-[110px] pointer-events-none"
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
            Powerful Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to navigate your cosmic journey
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-gold rounded-2xl p-6 group hover:glow-gold transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
