"use client"

import { motion } from "framer-motion"

const elements = [
  {
    name: "Wood",
    chinese: "木",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    keywords: "Growth, Creativity",
  },
  {
    name: "Fire",
    chinese: "火",
    color: "text-fire",
    bgColor: "bg-fire/10",
    keywords: "Passion, Action",
  },
  {
    name: "Earth",
    chinese: "土",
    color: "text-primary",
    bgColor: "bg-primary/10",
    keywords: "Stability, Trust",
  },
  {
    name: "Metal",
    chinese: "金",
    color: "text-metal",
    bgColor: "bg-metal/10",
    keywords: "Precision, Discipline",
  },
  {
    name: "Water",
    chinese: "水",
    color: "text-water",
    bgColor: "bg-water/10",
    keywords: "Wisdom, Adaptability",
  },
]

const archetypes = [
  { name: "The Ally", element: "wood" },
  { name: "The Maverick", element: "fire" },
  { name: "The Creator", element: "wood" },
  { name: "The Rebel", element: "fire" },
  { name: "The Adventurer", element: "water" },
  { name: "The Builder", element: "earth" },
  { name: "The Commander", element: "metal" },
  { name: "The Leader", element: "metal" },
  { name: "The Visionary", element: "water" },
  { name: "The Mentor", element: "earth" },
]

const elementColors: Record<string, string> = {
  wood: "border-secondary text-secondary",
  fire: "border-fire text-fire",
  earth: "border-primary text-primary",
  metal: "border-metal text-metal",
  water: "border-water text-water",
}

export function HowSajuWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            How Saju Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four steps to understanding your cosmic blueprint
          </p>
        </motion.div>

        {/* Step 1: Four Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              1
            </span>
            <h3 className="font-serif text-2xl font-semibold">
              Four Pillars, Eight Characters
            </h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Your birth year, month, day, and hour each form a &quot;pillar.&quot; Each
            pillar has two characters — a Heavenly Stem and an Earthly Branch.
            Together, these 8 characters create your cosmic DNA.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Year", "Month", "Day", "Hour"].map((label, index) => (
              <div key={label} className="pillar-card rounded-2xl p-6 text-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  {label}
                </span>
                <div className="text-3xl font-serif text-primary mb-2">
                  {["甲", "丙", "戊", "庚"][index]}
                </div>
                <div className="w-8 h-px bg-border mx-auto my-2" />
                <div className="text-2xl font-serif text-secondary">
                  {["子", "午", "寅", "申"][index]}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 2: Five Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              2
            </span>
            <h3 className="font-serif text-2xl font-semibold">
              The Five Elements
            </h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Everything in Saju maps to five cosmic forces: Wood, Fire, Earth,
            Metal, and Water. Their balance in your chart determines your
            personality, strengths, and life path.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {elements.map((element) => (
              <div
                key={element.name}
                className={`glass rounded-2xl p-6 text-center min-w-[140px] ${element.bgColor}`}
              >
                <div className={`text-4xl font-serif mb-2 ${element.color}`}>
                  {element.chinese}
                </div>
                <div className={`font-semibold mb-1 ${element.color}`}>
                  {element.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {element.keywords}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step 3: Day Master */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              3
            </span>
            <h3 className="font-serif text-2xl font-semibold">Your Day Master</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            The character on your Day Pillar&apos;s Heavenly Stem is your &quot;Day
            Master&quot; — the core of who you are. It&apos;s like your sun sign, but far
            more specific.
          </p>
          <div className="flex justify-center">
            <div className="pillar-card rounded-2xl p-8 text-center glow-gold">
              <span className="text-xs uppercase tracking-wider text-primary mb-3 block font-medium">
                Your Day Master
              </span>
              <div className="text-6xl font-serif text-primary mb-2">戊</div>
              <div className="text-sm text-muted-foreground">Yang Earth</div>
            </div>
          </div>
        </motion.div>

        {/* Step 4: Ten Archetypes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              4
            </span>
            <h3 className="font-serif text-2xl font-semibold">
              The Ten Archetypes
            </h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            The relationship between your Day Master and every other character
            reveals your dominant archetype — your natural approach to wealth,
            love, power, and creativity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {archetypes.map((archetype) => (
              <div
                key={archetype.name}
                className={`glass rounded-xl p-4 text-center border ${
                  elementColors[archetype.element]
                }`}
              >
                <span className="text-sm font-medium">{archetype.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
