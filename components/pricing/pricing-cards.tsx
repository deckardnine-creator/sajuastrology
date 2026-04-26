"use client"

// ════════════════════════════════════════════════════════════════════
// PricingCards (v6.4) — Five-tier plan grid with mobile-first layout.
// ════════════════════════════════════════════════════════════════════
// Tier structure (per chandler v6.4 spec):
//   1. Free                — saju + free compatibility + 1 Soram/day
//   2. Compatibility Full  — $2.99 one-time, 6-stage timing analysis
//   3. Soram Companion     — $4.99/month, unlimited Soram + 1 question reading
//   4. Full Destiny Reading — $9.99 one-time (most popular)
//   5. Master 5 Pack       — $29.99 one-time, 5 question readings + Full
//
// Layout strategy:
//   • Mobile (<sm): single column, all 5 cards stacked vertically.
//   • Tablet (sm): 2-column grid, Free spans both. The 4 paid plans
//     fit in 2x2 below.
//   • Desktop (lg): 5-column grid, all in one row.
//
// Routing:
//   • Free                  → /calculate (existing free flow)
//   • Compatibility Full    → /pricing/upgrade-compat (placeholder route — chandler opted-in)
//   • Soram Companion       → /pricing/soram-companion (placeholder route)
//   • Full Destiny Reading  → /calculate (existing — free reading then upsell)
//   • Master 5 Pack         → /consultation (existing)
// ════════════════════════════════════════════════════════════════════

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Sparkles, Crown, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { t, type TranslationKey } from "@/lib/translations"
import { safeSet } from "@/lib/safe-storage"
import { track, Events } from "@/lib/analytics"

interface PlanDef {
  nameKey: TranslationKey
  price: number
  priceSuffixKey?: TranslationKey
  descKey: TranslationKey
  badgeKey?: TranslationKey
  featureKeys: TranslationKey[]
  ctaKey: TranslationKey
  href: string
  highlighted: boolean
  accent: string
  glow: string
  glowSoft: string
  icon: typeof Sparkles
  priceNoteKey?: TranslationKey
  noSubKey?: TranslationKey
  comingSoon?: boolean
}

const PLANS: PlanDef[] = [
  {
    nameKey: "pc.free.name",
    price: 0,
    descKey: "pc.free.desc",
    featureKeys: ["pc.free.f1", "pc.free.f2", "pc.free.f3", "pc.free.f5", "pc.free.f6", "pc.free.f8"],
    ctaKey: "pc.free.cta",
    href: "/calculate",
    highlighted: false,
    accent: "#9CA3AF",
    glow: "rgba(156,163,175,0.25)",
    glowSoft: "rgba(156,163,175,0.06)",
    icon: Sparkles,
  },
  {
    nameKey: "pc.compat.name",
    price: 2.99,
    descKey: "pc.compat.desc",
    featureKeys: ["pc.compat.f1", "pc.compat.f2", "pc.compat.f3", "pc.compat.f4", "pc.compat.f5", "pc.compat.f6"],
    ctaKey: "pc.compat.cta",
    href: "/pricing/upgrade-compat",
    highlighted: false,
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.3)",
    glowSoft: "rgba(244,114,182,0.07)",
    icon: Heart,
    comingSoon: true,
  },
  {
    nameKey: "pc.companion.name",
    price: 4.99,
    priceSuffixKey: "pricing.perMonth",
    descKey: "pc.companion.desc",
    featureKeys: ["pc.companion.f1", "pc.companion.f2", "pc.companion.f3", "pc.companion.f4", "pc.companion.f5"],
    ctaKey: "pc.companion.cta",
    href: "/pricing/soram-companion",
    highlighted: false,
    accent: "#F2CA50",
    glow: "rgba(242,202,80,0.3)",
    glowSoft: "rgba(242,202,80,0.07)",
    icon: MessageCircle,
    priceNoteKey: "pricing.cancelAnytime",
    comingSoon: true,
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
    nameKey: "pc.master.name",
    price: 29.99,
    descKey: "pc.master.desc",
    // v6.15.1: removed "pc.master.includesFull" (was misleading — full
    // reading is NOT bundled with this purchase). Added value points
    // that emphasize the per-session economy: $29.99 / 5 = $6 vs the
    // standalone consultation rate. The bundle saves the user from
    // five separate $9-ish purchases and groups them in one dashboard.
    featureKeys: ["pc.master.savings", "pc.consult.f1", "pc.consult.f3", "pc.consult.f4", "pc.consult.f5", "pc.consult.f6"],
    priceNoteKey: "pc.consult.perSession",
    ctaKey: "pc.master.cta",
    href: "/consultation",
    highlighted: false,
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.3)",
    glowSoft: "rgba(167,139,250,0.07)",
    icon: Crown,
  },
]

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<number>(3)
  const { user, openSignInModal } = useAuth()
  const { locale } = useLanguage()
  const router = useRouter()

  const handlePlanClick = (plan: PlanDef) => {
    try {
      const planId = plan.nameKey.replace("pc.", "").replace(".name", "")
      track(Events.pricing_cta_clicked, {
        plan: planId,
        price: plan.price,
        href: plan.href,
        signed_in: !!user,
      })
    } catch {}

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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:items-stretch">
      {PLANS.map((plan, index) => {
        const isSelected = selectedPlan === index
        const badge = plan.badgeKey ? t(plan.badgeKey, locale) : null
        const tabletFullWidth = index === 0 ? "sm:col-span-2 lg:col-span-1" : ""

        return (
          <motion.div
            key={index}
            onClick={() => setSelectedPlan(index)}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isSelected ? 1.02 : 1,
              zIndex: isSelected ? 10 : plan.highlighted ? 5 : 1,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 28, delay: index * 0.06 }}
            className={`relative rounded-2xl cursor-pointer select-none flex flex-col ${tabletFullWidth}`}
            style={{
              padding: "1.5rem 1.25rem",
              background: isSelected
                ? `radial-gradient(ellipse at 50% 0%, ${plan.glowSoft} 0%, #1a1a2e 60%, #0f0f1a 100%)`
                : plan.highlighted ? "hsl(var(--card))" : "hsl(var(--card) / 0.6)",
              border: isSelected
                ? `2px solid ${plan.accent}`
                : plan.highlighted ? "1.5px solid rgba(242,202,80,0.4)" : `1px solid ${plan.accent}30`,
              boxShadow: isSelected
                ? `0 0 0 1px ${plan.accent}22, 0 8px 28px ${plan.glow}, 0 16px 40px ${plan.glowSoft}, inset 0 1px 0 ${plan.accent}30`
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
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="gold-gradient text-primary-foreground border-0 px-3 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                  {badge}
                </Badge>
              </div>
            )}
            {plan.comingSoon && (
              <div className="absolute top-3 right-3">
                <span className="text-[9px] uppercase tracking-wide bg-amber-500/15 text-amber-300/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {t("pricing.comingSoon", locale)}
                </span>
              </div>
            )}
            {isSelected && !plan.comingSoon && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: plan.accent, boxShadow: `0 0 10px ${plan.glow}` }}
              >
                <Check className="w-3.5 h-3.5 text-background" />
              </motion.div>
            )}

            <div className="flex justify-center mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${plan.accent}18`, border: `1px solid ${plan.accent}40` }}
              >
                <plan.icon className="w-5 h-5" style={{ color: plan.accent }} />
              </div>
            </div>

            <div className="text-center mb-4">
              <motion.h3
                animate={{
                  color: isSelected ? plan.accent : "hsl(var(--foreground))",
                  textShadow: isSelected ? `0 0 14px ${plan.glow}` : "none",
                }}
                transition={{ duration: 0.25 }}
                className="font-serif text-lg sm:text-xl font-semibold mb-1.5"
              >
                {t(plan.nameKey, locale)}
              </motion.h3>
              <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5em]">
                {t(plan.descKey, locale)}
              </p>
            </div>

            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-1 flex-wrap">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold text-primary">{t("pricing.free", locale)}</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary">${plan.price}</span>
                    <span className="text-muted-foreground text-xs">
                      {plan.priceSuffixKey ? t(plan.priceSuffixKey, locale) : t("pricing.oneTime", locale)}
                    </span>
                  </>
                )}
              </div>
              {plan.price > 0 && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {plan.priceNoteKey
                    ? t(plan.priceNoteKey, locale)
                    : plan.noSubKey
                    ? t(plan.noSubKey, locale)
                    : ""}
                </p>
              )}
            </div>

            <ul className="space-y-2 mb-5 flex-grow">
              {plan.featureKeys.map((fk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-snug">{t(fk, locale)}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePlanClick(plan)}
              className="w-full h-10 font-semibold text-xs tracking-wide transition-all duration-300"
              size="default"
              style={isSelected ? {
                background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}bb)`,
                color: "#0A0E1A",
                border: "none",
                boxShadow: `0 4px 14px ${plan.glow}`,
              } : {}}
              variant={isSelected || plan.highlighted ? "default" : "outline"}
            >
              {t(plan.ctaKey, locale)}
            </Button>

            {plan.price > 0 && locale === "ko" && (
              <p className="text-[9px] text-muted-foreground/40 mt-2 text-center leading-tight">
                {t("upgrade.koNotice", locale)}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
