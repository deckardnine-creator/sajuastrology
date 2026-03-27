"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Crown, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { safeSet } from "@/lib/safe-storage"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Discover your cosmic blueprint",
    features: [
      "Your Four Pillars (사주팔자) decoded",
      "Day Master & Archetype analysis",
      "Five Elements balance chart",
      "This year's fortune overview",
      "Compatibility check — full detailed analysis",
      "Personalized daily fortune",
      "Shareable profile & results",
    ],
    cta: "Get Started — Free",
    href: "/calculate",
    highlighted: false,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.3)",
    glowSoft: "rgba(242,202,80,0.08)",
    icon: Sparkles,
  },
  {
    name: "Full Destiny Reading",
    price: 9.99,
    description: "Your complete life blueprint",
    badge: "MOST POPULAR",
    features: [
      "Everything in Free, plus:",
      "10-year fortune cycle (대운) analysis",
      "Wealth & Career detailed blueprint",
      "Love & Relationship deep insights",
      "Health & wellness timing guidance",
      "Monthly energy calendar",
      "Hidden talent & life purpose",
      "Permanent reading — yours forever",
    ],
    cta: "Start Free → Upgrade to Full",
    href: "/calculate",
    highlighted: true,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.35)",
    glowSoft: "rgba(242,202,80,0.1)",
    icon: Sparkles,
  },
  {
    name: "Master Consultation",
    price: 29.99,
    description: "5 personal Saju consultations",
    features: [
      "Everything in Full Destiny, plus:",
      "5 one-on-one Saju consultation sessions",
      "Ask about career, love, timing, or any life question",
      "Clarifying dialogue for precision analysis",
      "2,000–4,000 word personalized report per session",
      "All consultations saved to your dashboard",
    ],
    priceNote: "$6 per consultation",
    cta: "Get 5 Consultations",
    href: "/consultation",
    highlighted: false,
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    glowSoft: "rgba(167,139,250,0.08)",
    icon: Crown,
  },
]

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<string>("Full Destiny Reading")
  const { user, openSignInModal } = useAuth()
  const router = useRouter()

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.price === 0) {
      router.push(plan.href)
      return
    }
    if (!user) {
      safeSet("auth-return-url", window.location.origin + plan.href)
      openSignInModal()
      return
    }
    router.push(plan.href)
  }

  return (
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
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold text-primary">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-primary">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">one-time</span>
                  </>
                )}
              </div>
              {plan.price > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {"priceNote" in plan && plan.priceNote
                    ? plan.priceNote
                    : "No subscription. Pay once, keep forever."}
                </p>
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
              onClick={() => handlePlanClick(plan)}
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
  )
}
