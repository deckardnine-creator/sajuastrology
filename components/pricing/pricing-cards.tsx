"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Crown, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { t, type TranslationKey } from "@/lib/translations"
import { safeSet } from "@/lib/safe-storage"

interface PlanDef {
  nameKey: TranslationKey;
  price: number;
  descKey: TranslationKey;
  badgeKey?: TranslationKey;
  featureKeys: TranslationKey[];
  ctaKey: TranslationKey;
  href: string;
  highlighted: boolean;
  accent: string;
  glow: string;
  glowSoft: string;
  icon: typeof Sparkles;
  priceNoteKey?: TranslationKey;
  noSubKey?: TranslationKey;
}

const PLANS: PlanDef[] = [
  {
    nameKey: "pc.free.name",
    price: 0,
    descKey: "pc.free.desc",
    featureKeys: ["pc.free.f1", "pc.free.f2", "pc.free.f3", "pc.free.f4", "pc.free.f5", "pc.free.f6", "pc.free.f7"],
    ctaKey: "pc.free.cta",
    href: "/calculate",
    highlighted: false,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.3)",
    glowSoft: "rgba(242,202,80,0.08)",
    icon: Sparkles,
  },
  {
    nameKey: "pc.full.name",
    price: 9.99,
    descKey: "pc.full.desc",
    badgeKey: "pc.full.badge",
    featureKeys: ["pc.full.f1", "pc.full.f2", "pc.full.f3", "pc.full.f4", "pc.full.f5", "pc.full.f6", "pc.full.f7", "pc.full.f8"],
    ctaKey: "pc.full.cta",
    href: "/calculate",
    highlighted: true,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.35)",
    glowSoft: "rgba(242,202,80,0.1)",
    icon: Sparkles,
    noSubKey: "pc.full.noSub",
  },
  {
    nameKey: "pc.consult.name",
    price: 29.99,
    descKey: "pc.consult.desc",
    featureKeys: ["pc.consult.f1", "pc.consult.f2", "pc.consult.f3", "pc.consult.f4", "pc.consult.f5", "pc.consult.f6"],
    priceNoteKey: "pc.consult.perSession",
    ctaKey: "pc.consult.cta",
    href: "/consultation",
    highlighted: false,
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    glowSoft: "rgba(167,139,250,0.08)",
    icon: Crown,
  },
]

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<number>(1)
  const { user, openSignInModal } = useAuth()
  const { locale } = useLanguage()
  const router = useRouter()

  const handlePlanClick = (plan: PlanDef) => {
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
      {PLANS.map((plan, index) => {
        const isSelected = selectedPlan === index
        const badge = plan.badgeKey ? t(plan.badgeKey, locale) : null
        return (
          <motion.div
            key={index}
            onClick={() => setSelectedPlan(index)}
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
            {badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="gold-gradient text-primary-foreground border-0 px-4 text-xs font-semibold">{badge}</Badge>
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
                {t(plan.nameKey, locale)}
              </motion.h3>
              <p className="text-sm text-muted-foreground mb-4">{t(plan.descKey, locale)}</p>
              <div className="flex items-baseline justify-center gap-1">
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold text-primary">{t("pricing.free", locale)}</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-primary">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">{t("pricing.oneTime", locale)}</span>
                  </>
                )}
              </div>
              {plan.price > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {plan.priceNoteKey
                    ? t(plan.priceNoteKey, locale)
                    : plan.noSubKey
                    ? t(plan.noSubKey, locale)
                    : ""}
                </p>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plan.featureKeys.map((fk, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{t(fk, locale)}</span>
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
              {t(plan.ctaKey, locale)}
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
