import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { SajuHero } from "@/components/education/saju-hero"
import { ComparisonHook } from "@/components/education/comparison-hook"
import { HowSajuWorks } from "@/components/education/how-saju-works"
import { WhyDifferent } from "@/components/education/why-different"
import { CredibilitySection } from "@/components/education/credibility-section"
import { EducationCTA } from "@/components/education/education-cta"

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
