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
    <main className="min-h-screen">
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
