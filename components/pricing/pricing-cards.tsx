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
    glowColor: "rgba(242,202,80,0.15)",
    borderColor: "rgba(242,202,80,0.5)",
    accentColor: "#F2CA50",
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
    glowColor: "rgba(242,202,80,0.25)",
    borderColor: "rgba(242,202,80,0.8)",
    accentColor: "#F2CA50",
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
    glowColor: "rgba(167,139,250,0.2)",
    borderColor: "rgba(167,139,250,0.6)",
    accentColor: "#a78bfa",
  },
]

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium")

  return (
    <div>
      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-4 mb-12"
      >
        <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
        <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
        {isAnnual && (
          <Badge className="bg-secondary/20 text-secondary border-0">Save 20%</Badge>
        )}
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.name

          return (
            <motion.div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: plan.highlighted ? 0 : isSelected ? -8 : 0,
                scale: isSelected ? 1.02 : plan.highlighted ? 1 : 0.97,
              }}
              transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 300, damping: 30 }}
              className="relative rounded-2xl p-8 cursor-pointer select-none"
              style={{
                background: plan.highlighted
                  ? "var(--card-elevated, hsl(var(--card)))"
                  : isSelected
                    ? `radial-gradient(ellipse at top, ${plan.glowColor}, transparent 70%), hsl(var(--card))`
                    : "hsl(var(--card) / 0.5)",
                border: isSelected
                  ? `1.5px solid ${plan.borderColor}`
                  : "1px solid hsl(var(--border))",
                boxShadow: isSelected
                  ? `0 0 40px ${plan.glowColor}, 0 0 80px ${plan.glowColor.replace("0.2", "0.08").replace("0.15", "0.06")}`
                  : plan.highlighted
                    ? `0 0 30px rgba(242,202,80,0.2)`
                    : "none",
                backdropFilter: "blur(12px)",
                paddingTop: plan.highlighted || isSelected ? "3rem" : "2rem",
                paddingBottom: plan.highlighted || isSelected ? "3rem" : "2rem",
                marginTop: plan.highlighted ? "-1rem" : "0",
                marginBottom: plan.highlighted ? "-1rem" : "0",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gold-gradient text-primary-foreground border-0 px-4">{plan.badge}</Badge>
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && !plan.highlighted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: plan.accentColor }}
                >
                  <Check className="w-3.5 h-3.5 text-background" />
                </motion.div>
              )}

              <div className="text-center mb-6">
                <motion.h3
                  className="font-serif text-2xl font-semibold mb-2"
                  animate={{ color: isSelected ? plan.accentColor : "hsl(var(--foreground))" }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.name}
                </motion.h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price.monthly > 0 ? "/ month" : "/ forever"}
                  </span>
                </div>
                {plan.price.monthly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAnnual ? "billed annually" : "billed monthly"}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full transition-all duration-300"
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${plan.accentColor}, ${plan.accentColor}cc)`,
                        color: "#0A0E1A",
                        border: "none",
                        fontWeight: 600,
                      }
                    : plan.highlighted
                      ? {}
                      : {}
                }
                variant={plan.highlighted || isSelected ? "default" : "outline"}
                size="lg"
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
