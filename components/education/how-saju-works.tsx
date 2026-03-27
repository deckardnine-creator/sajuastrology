"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

const elementColors: Record<string, string> = {
  wood: "border-secondary text-secondary",
  fire: "border-fire text-fire",
  earth: "border-primary text-primary",
  metal: "border-metal text-metal",
  water: "border-water text-water",
}

const archetypeElements = [
  "wood", "fire", "wood", "fire", "water",
  "earth", "metal", "metal", "water", "earth",
]

export function HowSajuWorks() {
  const { locale } = useLanguage()

  const elements = [
    { chinese: "木", color: "text-secondary", bgColor: "bg-secondary/10", name: t("wis.el.wood", locale), keywords: t("wis.el.wood.kw", locale) },
    { chinese: "火", color: "text-fire",      bgColor: "bg-fire/10",      name: t("wis.el.fire", locale), keywords: t("wis.el.fire.kw", locale) },
    { chinese: "土", color: "text-primary",   bgColor: "bg-primary/10",   name: t("wis.el.earth", locale), keywords: t("wis.el.earth.kw", locale) },
    { chinese: "金", color: "text-metal",     bgColor: "bg-metal/10",     name: t("wis.el.metal", locale), keywords: t("wis.el.metal.kw", locale) },
    { chinese: "水", color: "text-water",     bgColor: "bg-water/10",     name: t("wis.el.water", locale), keywords: t("wis.el.water.kw", locale) },
  ]

  const archetypes = [
    t("wis.arch.ally", locale),
    t("wis.arch.maverick", locale),
    t("wis.arch.creator", locale),
    t("wis.arch.rebel", locale),
    t("wis.arch.adventurer", locale),
    t("wis.arch.builder", locale),
    t("wis.arch.commander", locale),
    t("wis.arch.leader", locale),
    t("wis.arch.visionary", locale),
    t("wis.arch.mentor", locale),
  ]

  const pillarLabels = [
    t("reading.pillarYear", locale),
    t("reading.pillarMonth", locale),
    t("reading.pillarDay", locale),
    t("reading.pillarHour", locale),
  ]

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
            {t("wis.how.title", locale)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("wis.how.desc", locale)}
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
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">1</span>
            <h3 className="font-serif text-2xl font-semibold">{t("wis.how.s1.title", locale)}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{t("wis.how.s1.desc", locale)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pillarLabels.map((label, index) => (
              <div key={label} className="pillar-card rounded-2xl p-6 text-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">{label}</span>
                <div className="text-3xl font-serif text-primary mb-2">{["甲", "丙", "戊", "庚"][index]}</div>
                <div className="w-8 h-px bg-border mx-auto my-2" />
                <div className="text-2xl font-serif text-secondary">{["子", "午", "寅", "申"][index]}</div>
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
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">2</span>
            <h3 className="font-serif text-2xl font-semibold">{t("wis.how.s2.title", locale)}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{t("wis.how.s2.desc", locale)}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {elements.map((el) => (
              <div key={el.name} className={`glass rounded-2xl p-6 text-center min-w-[140px] ${el.bgColor}`}>
                <div className={`text-4xl font-serif mb-2 ${el.color}`}>{el.chinese}</div>
                <div className={`font-semibold mb-1 ${el.color}`}>{el.name}</div>
                <div className="text-xs text-muted-foreground">{el.keywords}</div>
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
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">3</span>
            <h3 className="font-serif text-2xl font-semibold">{t("wis.how.s3.title", locale)}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{t("wis.how.s3.desc", locale)}</p>
          <div className="flex justify-center">
            <div className="pillar-card rounded-2xl p-8 text-center glow-gold">
              <span className="text-xs uppercase tracking-wider text-primary mb-3 block font-medium">
                {t("wis.how.s3.label", locale)}
              </span>
              <div className="text-6xl font-serif text-primary mb-2">戊</div>
              <div className="text-sm text-muted-foreground">{t("wis.how.s3.example", locale)}</div>
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
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">4</span>
            <h3 className="font-serif text-2xl font-semibold">{t("wis.how.s4.title", locale)}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{t("wis.how.s4.desc", locale)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {archetypes.map((name, i) => (
              <div
                key={i}
                className={`glass rounded-xl p-4 text-center border ${elementColors[archetypeElements[i]]}`}
              >
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
