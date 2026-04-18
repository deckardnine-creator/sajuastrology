import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { SajuHero } from "@/components/education/saju-hero"
import { ComparisonHook } from "@/components/education/comparison-hook"
import { HowSajuWorks } from "@/components/education/how-saju-works"
import { WhyDifferent } from "@/components/education/why-different"
import { CredibilitySection } from "@/components/education/credibility-section"
import { EducationCTA } from "@/components/education/education-cta"

const BASE_URL = "https://sajuastrology.com"

export const metadata: Metadata = {
  title: "What is Saju? — Korean Four Pillars of Destiny Explained",
  description: "Learn what Saju (사주) is — the 2,000-year-old Korean astrology system based on your birth date and time. How the Four Pillars, Day Master, and Five Elements reveal your cosmic blueprint. More precise than Western astrology.",
  keywords: ["what is saju", "saju explained", "korean astrology basics", "four pillars of destiny", "day master", "five elements", "bazi explained"],
  openGraph: {
    title: "What is Saju? — Korean Four Pillars of Destiny Explained",
    description: "The 2,000-year-old Korean astrology system. 518,400 unique profiles based on the exact moment of your birth.",
    url: `${BASE_URL}/what-is-saju`,
    type: "article",
  },
  alternates: {
    canonical: `${BASE_URL}/what-is-saju`,
    languages: {
      "x-default": `${BASE_URL}/what-is-saju`,
      en: `${BASE_URL}/what-is-saju`,
      ko: `${BASE_URL}/what-is-saju`,
      ja: `${BASE_URL}/what-is-saju`,
      es: `${BASE_URL}/what-is-saju`,
    },
  },
}

export default function WhatIsSajuPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Deep knowledge / ancient wisdom glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Indigo top-left — ancient depth */}
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-indigo-700/20 blur-[140px]" />
        {/* Teal center-right — wisdom/water */}
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-teal-600/15 blur-[130px]" />
        {/* Gold mid — 5000 year heritage */}
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] rounded-full bg-yellow-600/12 blur-[130px]" />
        {/* Deep purple bottom */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-purple-800/18 blur-[140px]" />
      </div>

      <Navbar />
      <SajuHero />
      <ComparisonHook />
      <HowSajuWorks />
      <WhyDifferent />
      <CredibilitySection />
      <EducationCTA />
      <Footer />
    </main>
  )
}
