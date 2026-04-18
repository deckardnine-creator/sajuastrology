"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"
import { useNativeApp } from "@/lib/native-app"
import { requestIAP, onFlutterMessage } from "@/lib/flutter-bridge"
import { track, Events } from "@/lib/analytics"

export function UpgradeCTA() {
  const { locale } = useLanguage()
  const isNative = useNativeApp()
  const pathname = usePathname()

  // Extract shareSlug from URL: /reading/[slug] → slug
  const shareSlug = pathname.startsWith("/reading/")
    ? pathname.split("/reading/")[1]?.split("?")[0] || ""
    : ""

  // Listen for IAP success from Flutter — reload page to show unlocked content
  useEffect(() => {
    if (!isNative) return
    const unsub = onFlutterMessage("iap:success:", (_slug) => {
      window.location.reload()
    })
    return unsub
  }, [isNative])

  const handleIAPPurchase = () => {
    // ── Mixpanel: user requested in-app purchase from the /reading/ upgrade CTA ──
    // Paired with iap:success / iap:error listeners below to measure conversion.
    try {
      track(Events.iap_purchase_requested_web, {
        product: "full_destiny_reading",
        share_slug: shareSlug,
        surface: "upgrade_cta",
      });
    } catch {}
    requestIAP("full_destiny_reading", shareSlug)
  }

  // ── Mixpanel: track web-side IAP outcomes reported back by Flutter ──
  // These events run inside the WebView so we can correlate web funnel steps
  // (reading view → upgrade CTA click → IAP sheet → success/error) end-to-end.
  useEffect(() => {
    if (!isNative) return
    const unsubSuccessWeb = onFlutterMessage("iap:success:", () => {
      try {
        track(Events.iap_purchase_success_web, {
          product: "full_destiny_reading",
          share_slug: shareSlug,
          surface: "upgrade_cta",
        });
      } catch {}
    })
    const unsubErrorWeb = onFlutterMessage("iap:error:", (payload) => {
      try {
        track(Events.iap_purchase_error_web, {
          product: "full_destiny_reading",
          share_slug: shareSlug,
          surface: "upgrade_cta",
          reason: payload || "unknown",
        });
      } catch {}
    })
    return () => {
      unsubSuccessWeb()
      unsubErrorWeb()
    }
  }, [isNative, shareSlug])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mb-12"
    >
      <div className="glass-gold rounded-2xl p-8 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-bold mb-3">
          {t("upgrade.title", locale)}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          {t("upgrade.desc", locale)}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isNative ? (
            /* App mode: trigger Flutter IAP */
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground font-semibold"
              onClick={handleIAPPurchase}
            >
              {t("upgrade.ctaApp", locale)}
            </Button>
          ) : (
            /* Web mode: link to pricing page (PayPal) */
            <Link
              href="/pricing"
              onClick={() => {
                // Mixpanel: web-mode upgrade CTA click → drives pricing page funnel
                try {
                  track(Events.upgrade_cta_clicked, {
                    surface: "upgrade_cta",
                    mode: "web",
                    share_slug: shareSlug,
                  });
                } catch {}
              }}
            >
              <Button
                size="lg"
                className="gold-gradient text-primary-foreground font-semibold"
              >
                {t("upgrade.cta", locale)}
              </Button>
            </Link>
          )}
          <Link
            href="/daily"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("upgrade.free", locale)}
          </Link>
        </div>
        {locale === "ko" && !isNative && (
          <p className="text-[10px] text-muted-foreground/40 mt-3">{t("upgrade.koNotice", locale)}</p>
        )}
      </div>
    </motion.section>
  )
}
