import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BlogList } from "@/components/blog/blog-list";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Saju Astrology Blog — Korean Four Pillars Guides & Insights",
  description: "Learn about Saju (사주), the Korean Four Pillars of Destiny. Guides on Day Masters, Five Elements, birth chart readings, love compatibility, and how Saju compares to Western astrology.",
  keywords: ["saju blog", "korean astrology guide", "four pillars explained", "bazi articles", "astrology blog"],
  openGraph: {
    title: "Saju Astrology Blog — Korean Four Pillars Guides & Insights",
    description: "Deep dives into Saju astrology. Day Masters, Five Elements, compatibility, and more.",
    url: "https://sajuastrology.com/blog",
  },
  alternates: {
    canonical: "https://sajuastrology.com/blog",
    languages: {
      "x-default": "https://sajuastrology.com/blog",
      en: "https://sajuastrology.com/blog",
      ko: "https://sajuastrology.com/blog",
      ja: "https://sajuastrology.com/blog",
      es: "https://sajuastrology.com/blog",
    },
  },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[140px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px]" />
      </div>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Direct funnel to free reading / compatibility
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-page-lg pb-8 sm:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">

            {/* LEFT — Headline + CTAs */}
            <div className="flex flex-col gap-5 order-2 lg:order-1">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15]">
                Your Birth Date Holds a
                <br />
                <span className="gold-gradient-text">5,000-Year-Old Code.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique
                cosmic profiles. Get your free Korean Four Pillars reading in 30 seconds.
              </p>

              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground/80">#1 on ChatGPT</span>
                </span>
                <span className="hidden sm:inline text-muted-foreground/40">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                  30+ countries · 10 languages
                </span>
              </div>

              {/* Dual CTAs — both lead to home: lets first-time readers see
                  the full hero (Soram visual, app store badges, social proof)
                  before being asked for personal data. Conversion comes from
                  trust built by home + visibility of app install badges
                  critical for recurring DAU. */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link href="/" className="block">
                  <Button
                    size="lg"
                    className="gold-gradient text-primary-foreground font-semibold text-base px-6 w-full sm:w-auto min-h-[48px] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(234,179,8,0.35)] transition-all"
                  >
                    Free Saju Reading
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold text-base px-6 w-full sm:w-auto min-h-[48px] hover:-translate-y-0.5 transition-all"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Check Compatibility — Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground/70 mt-1">
                No signup required · Results in 30 seconds
              </p>
            </div>

            {/* RIGHT — App mockup */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[260px] sm:max-w-[300px]"
                style={{
                  filter: "drop-shadow(0 20px 50px rgba(234, 179, 8, 0.15))",
                }}
              >
                <Image
                  src="/app/five-elements-balance.webp"
                  alt="SajuAstrology app — Five Elements Balance screen"
                  width={600}
                  height={1300}
                  className="w-full h-auto rounded-[28px] border border-white/10"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PUBLISHER TRUST STRIP
          
          Sits between Hero and Blog List — caught by every reader who
          lands on /blog (the heaviest-traffic SEO entry point) before
          they decide whether to click into individual articles.
          
          Purpose: tell Google E-E-A-T signal AND tell readers who
          publishes this content. The strip names Rimfactory once
          (with a credible mission), then the small NVIDIA Inception
          member badge as a single, accurate trust signal.
          
          Per NVIDIA Inception Brand Guidelines:
            • "Member of NVIDIA Inception" official wording
            • Badge sized smaller than Rimfactory's identity
            • One mention, no endorsement claims
            • English wording across all locales (proper program name)
          ═══════════════════════════════════════════════════════════ */}
      <section className="pb-2 sm:pb-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm px-5 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* LEFT — Publisher mission (most visual weight: Rimfactory) */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">
                Published by Rimfactory
              </p>
              <p className="text-sm sm:text-base text-foreground/85 leading-snug">
                An Astrotech AI startup building the world's most precise Saju engine.
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground/70 leading-snug mt-1.5">
                562 classical passages · Multi-LLM cross-validation · 10 languages
              </p>
            </div>

            {/* RIGHT — Small NVIDIA Inception member badge (single, accurate signal) */}
            <div className="flex items-center gap-2.5 sm:border-l sm:border-border/40 sm:pl-6 shrink-0">
              <img
                src="/badges/nvidia/inception.svg"
                alt="NVIDIA Inception Program Member"
                className="h-7 w-auto opacity-90"
                width="84"
                height="28"
                style={{ objectFit: "contain" }}
              />
              <div className="text-left">
                <p className="text-[11px] font-medium text-foreground/70 leading-tight">
                  Member of NVIDIA Inception
                </p>
                <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
                  Astrotech AI Startup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BLOG LIST
          ═══════════════════════════════════════════════════════════ */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 border-t border-border/30 pt-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
              Saju Astrology <span className="gold-gradient-text">Blog</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Guides, insights, and deep dives into the Korean Four Pillars of Destiny.
            </p>
          </div>
          <BlogList />
        </div>
      </section>

      <Footer />
    </main>
  );
}
