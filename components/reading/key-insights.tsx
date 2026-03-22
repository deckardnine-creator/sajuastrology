"use client"

import { motion } from "framer-motion"
import { Wallet, Heart, Briefcase, Calendar } from "lucide-react"

interface Insight {
  title: string
  content: string
}

interface KeyInsightsProps {
  insights: Insight[]
}

const icons = [Wallet, Heart, Briefcase, Calendar]

export function KeyInsights({ insights }: KeyInsightsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mb-12"
    >
      <h2 className="font-serif text-2xl font-bold mb-6">Key Insights</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight, index) => {
          const Icon = icons[index % icons.length]
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="glass rounded-2xl p-6 hover:glow-gold transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
