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
    variant: "outline" as const,
    highlighted: false,
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
    variant: "default" as const,
    highlighted: true,
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
    variant: "outline" as const,
    highlighted: false,
  },
]

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div>
      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-4 mb-12"
      >
        <span
          className={`text-sm ${
            !isAnnual ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monthly
        </span>
        <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
        <span
          className={`text-sm ${
            isAnnual ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Annual
        </span>
        {isAnnual && (
          <Badge className="bg-secondary/20 text-secondary border-0">
            Save 20%
          </Badge>
        )}
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative rounded-2xl p-8 ${
              plan.highlighted
                ? "glow-gold bg-card-elevated lg:-my-4 lg:py-12"
                : "glass"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gold-gradient text-primary-foreground border-0 px-4">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl font-semibold mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
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
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${
                plan.highlighted
                  ? "gold-gradient text-primary-foreground"
                  : "border-primary/30 text-primary hover:bg-primary/10"
              }`}
              variant={plan.variant}
              size="lg"
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
