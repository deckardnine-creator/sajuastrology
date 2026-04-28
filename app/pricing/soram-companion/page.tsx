"use client"

// ════════════════════════════════════════════════════════════════════
// /pricing/soram-companion — Soram Companion subscription detail page
// ════════════════════════════════════════════════════════════════════
// v1.3.8 (2026-04-28) — Replaced "Coming Soon" placeholder with full
// subscription detail page that satisfies App Store Guideline 3.1.2(c)
// and Google Play subscription disclosure requirements:
//
//   • Title of subscription
//   • Length of subscription period (1 month)
//   • Price per period ($4.99 USD)
//   • What is included (functional benefits)
//   • Auto-renewal disclosure
//   • Cancellation method
//   • Links to Terms of Use (EULA) and Privacy Policy
//
// English-only by design — legal disclosure surface; consistent across
// platforms (web / iOS / Android via WebView). The page itself remains
// reachable from /pricing card CTA, App Store Connect description
// links, and Apple App Review.
// ════════════════════════════════════════════════════════════════════

import { useEffect } from "react"
import Link from "next/link"
import { MessageCircle, ArrowRight, ArrowLeft, Sparkles, Infinity as InfinityIcon, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { track, Events } from "@/lib/analytics"

export default function SoramCompanionPage() {
  useEffect(() => {
    try {
      track(Events.pricing_cta_clicked, {
        plan: "soram-companion-detail",
        landed_on_detail: true,
      })
    } catch {}
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/12 blur-[140px]" />
      </div>

      <Navbar />

      <section className="pt-20 sm:pt-28 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">

          {/* ─────────── Header ─────────── */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 mb-5 overflow-hidden shadow-lg shadow-amber-500/30">
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-2xl">🌙</span>
              <img
                src="/soram/soram_nav.webp"
                alt=""
                aria-hidden="true"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = "none"
                }}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
              Soram Companion
            </h1>
            <p className="text-sm text-muted-foreground">
              Auto-renewable monthly subscription
            </p>
          </div>

          {/* ─────────── Price card ─────────── */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 mb-8">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-base font-semibold">Subscription</span>
              <span className="text-2xl font-bold text-amber-300">
                $4.99 <span className="text-sm font-normal text-amber-300/80">USD / month</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Length: 1 month · Auto-renews until canceled
            </p>

            <div className="border-t border-amber-500/20 pt-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <InfinityIcon className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                <span className="text-sm">
                  Unlimited daily conversations with Soram, your saju-aware AI companion
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                <span className="text-sm">
                  One Master-tier consultation credit per billing month (a $6 value)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                <span className="text-sm">
                  Continuity — Soram remembers your saju and prior conversations
                </span>
              </div>
            </div>
          </div>

          {/* ─────────── How to subscribe ─────────── */}
          <div className="rounded-2xl border border-border bg-card/30 p-6 mb-6">
            <h2 className="font-serif text-lg mb-3">How to subscribe</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Subscription is offered through your conversation with Soram. Open the
              chat, ask Soram a question, and a subscription card will appear inside
              the chat with the same disclosures shown above.
            </p>
            <Link href="/soram" className="block">
              <Button className="w-full h-12 gold-gradient text-primary-foreground font-semibold">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Soram
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* ─────────── Subscription terms (App Store 3.1.2(c) compliant) ─────────── */}
          <div className="rounded-2xl border border-border bg-card/20 p-6 mb-6 text-xs leading-relaxed text-muted-foreground space-y-3">
            <h2 className="font-serif text-base text-foreground mb-1">Subscription terms</h2>

            <p>
              <strong className="text-foreground">Title:</strong> Soram Companion
            </p>
            <p>
              <strong className="text-foreground">Length:</strong> 1 month per billing period
            </p>
            <p>
              <strong className="text-foreground">Price:</strong> $4.99 USD per month, charged
              at the start of each billing period
            </p>
            <p>
              <strong className="text-foreground">Auto-renewal:</strong> Payment is charged to
              your selected payment method at the start of each billing period. The
              subscription automatically renews unless auto-renewal is turned off at
              least 24 hours before the end of the current period. Your account will
              be charged for renewal within 24 hours prior to the end of the current
              period.
            </p>
            <p>
              <strong className="text-foreground">How to cancel — iOS App Store:</strong> Open
              <em> Settings → [your name] → Subscriptions</em> on your iPhone or iPad,
              tap <em>Soram Companion</em>, and tap <em>Cancel Subscription</em>. You
              keep access through the end of the current paid period.
            </p>
            <p>
              <strong className="text-foreground">How to cancel — Google Play:</strong> Open
              the Google Play Store app, tap your profile icon →
              <em> Payments &amp; subscriptions → Subscriptions</em>, select <em>Soram
              Companion</em>, and tap <em>Cancel subscription</em>.
            </p>
            <p>
              <strong className="text-foreground">How to cancel — Web (PayPal):</strong> Cancel
              from your{" "}
              <Link href="/dashboard" className="text-primary hover:underline">
                dashboard
              </Link>{" "}
              or by emailing{" "}
              <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">
                info@rimfactory.io
              </a>
              . You can also cancel directly from your PayPal account under{" "}
              <em>Payments → Manage automatic payments</em>.
            </p>
            <p>
              <strong className="text-foreground">Refunds:</strong> Already-billed monthly
              periods are not refundable, except as required by applicable
              consumer-protection law or by Apple / Google policy. App Store and
              Google Play purchases are subject to their respective refund policies
              and can be requested through those stores directly.
            </p>
            <p>
              <strong className="text-foreground">Free tier:</strong> If you do not
              subscribe, Soram remains free for one conversation per day. The free
              tier never expires and never charges you.
            </p>
          </div>

          {/* ─────────── Legal links ─────────── */}
          <div className="text-center text-xs text-muted-foreground mb-6">
            By subscribing, you agree to the{" "}
            <Link
              href="/terms"
              className="text-primary hover:underline"
            >
              Terms of Use
            </Link>{" "}
            and acknowledge the{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </div>

          <div className="flex justify-center">
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
