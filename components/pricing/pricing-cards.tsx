"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Seeker",
    price: { monthly: 0, annual: 0 },
    description: "Start your journey",
    features: [
      "Basic Four Pillars analysis",
      "Daily energy score (1-line summary)",
      "Five Elements balance chart",
      "3 detailed readings per month",
      "Archetype identification",
    ],
    cta: "Start Free",
    highlighted: false,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.3)",
    glowSoft: "rgba(242,202,80,0.08)",
  },
  {
    name: "Premium",
    price: { monthly: 9.99, annual: 7.99 },
    description: "Full cosmic access",
    badge: "MOST POPULAR",
    features: [
      "Everything in Seeker, plus:",
      "Unlimited daily, weekly & monthly readings",
      "Wealth & Career Blueprint (10-year cycle)",
      "Love Synergy & compatibility analysis",
      "Luck Pillar (대운) decade forecast",
      "Oracle Chat — AI-powered consultation",
      "Ad-free experience",
    ],
    cta: "Unlock Premium",
    highlighted: true,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.35)",
    glowSoft: "rgba(242,202,80,0.1)",
  },
  {
    name: "Master",
    price: { monthly: 29.99, annual: 23.99 },
    description: "Ultimate guidance",
    features: [
      "Everything in Premium, plus:",
      "Annual comprehensive PDF report",
      "Monthly Master Reading (highest precision)",
      "Date Selection (택일) — optimal dates",
      "Priority Oracle Chat responses",
      "Early access to new features",
    ],
    cta: "Go Master",
    highlighted: false,
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    glowSoft: "rgba(167,139,250,0.08)",
  },
]

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium")

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-4 mb-12"
      >
        <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
        <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
        {isAnnual && <Badge className="bg-secondary/20 text-secondary border-0">Save 20%</Badge>}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-center">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.name
          return (
            <motion.div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: isSelected ? -14 : plan.highlighted && !isSelected ? -4 : 0,
                scale: isSelected ? 1.04 : 1,
                zIndex: isSelected ? 10 : plan.highlighted ? 5 : 1,
              }}
              transition={{ type: "spring", stiffness: 340, damping: 28, delay: index * 0.08 }}
              className="relative rounded-2xl cursor-pointer select-none"
              style={{
                padding: isSelected ? "3rem 2rem" : plan.highlighted ? "2.5rem 2rem" : "2rem",
                background: isSelected
                  ? `radial-gradient(ellipse at 50% 0%, ${plan.glowSoft} 0%, #1a1a2e 60%, #0f0f1a 100%)`
                  : plan.highlighted ? "hsl(var(--card))" : "hsl(var(--card) / 0.6)",
                border: isSelected
                  ? `2px solid ${plan.accent}`
                  : plan.highlighted ? "1.5px solid rgba(242,202,80,0.4)" : "1px solid hsl(var(--border))",
                boxShadow: isSelected
                  ? `0 0 0 1px ${plan.accent}22, 0 8px 40px ${plan.glow}, 0 24px 60px ${plan.glowSoft}, inset 0 1px 0 ${plan.accent}30`
                  : plan.highlighted ? "0 4px 24px rgba(242,202,80,0.15)" : "none",
                backdropFilter: "blur(16px)",
              }}
            >
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${plan.accent}, transparent)` }}
                />
              )}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gold-gradient text-primary-foreground border-0 px-4 text-xs font-semibold">{plan.badge}</Badge>
                </div>
              )}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: plan.accent, boxShadow: `0 0 12px ${plan.glow}` }}
                >
                  <Check className="w-4 h-4 text-background" />
                </motion.div>
              )}
              <div className="text-center mb-6">
                <motion.h3
                  animate={{ color: isSelected ? plan.accent : "hsl(var(--foreground))", textShadow: isSelected ? `0 0 20px ${plan.glow}` : "none" }}
                  transition={{ duration: 0.25 }}
                  className="font-serif text-2xl font-semibold mb-2"
                >
                  {plan.name}
                </motion.h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">${isAnnual ? plan.price.annual : plan.price.monthly}</span>
                  <span className="text-muted-foreground text-sm">{plan.price.monthly > 0 ? "/ month" : "/ forever"}</span>
                </div>
                {plan.price.monthly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{isAnnual ? "billed annually" : "billed monthly"}</p>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-12 font-semibold text-sm tracking-wide transition-all duration-300"
                size="lg"
                style={isSelected ? { background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}bb)`, color: "#0A0E1A", border: "none", boxShadow: `0 4px 20px ${plan.glow}` } : {}}
                variant={isSelected || plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
