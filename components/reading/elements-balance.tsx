"use client"

import { motion } from "framer-motion"

interface ElementsBalanceProps {
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  analysis: string
}

const elementConfig = [
  { key: "wood", label: "Wood", color: "bg-secondary" },
  { key: "fire", label: "Fire", color: "bg-fire" },
  { key: "earth", label: "Earth", color: "bg-primary" },
  { key: "metal", label: "Metal", color: "bg-metal" },
  { key: "water", label: "Water", color: "bg-water" },
] as const

export function ElementsBalance({ elements, analysis }: ElementsBalanceProps) {
  const maxValue = Math.max(...Object.values(elements))

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-12"
    >
      <h2 className="font-serif text-2xl font-bold mb-6">
        Five Elements Balance
      </h2>
      <div className="glass rounded-2xl p-6 sm:p-8">
        {/* Bar Chart */}
        <div className="space-y-4 mb-6">
          {elementConfig.map((element) => {
            const value = elements[element.key]
            const percentage = (value / maxValue) * 100

            return (
              <div key={element.key} className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">
                  {element.label}
                </span>
                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className={`h-full ${element.color} rounded-full flex items-center justify-end pr-3`}
                  >
                    <span className="text-xs font-semibold text-primary-foreground">
                      {value}
                    </span>
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Analysis */}
        <div className="border-t border-border pt-6">
          <p className="text-muted-foreground leading-relaxed">{analysis}</p>
        </div>
      </div>
    </motion.section>
  )
}
