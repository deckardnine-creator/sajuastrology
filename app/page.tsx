import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { WhyItWorks } from "@/components/landing/why-it-works"
import { ComparisonSection } from "@/components/landing/comparison-section"
import { CTABanner } from "@/components/landing/cta-banner"
import { Footer } from "@/components/landing/footer"
import { AutoOpenSignin } from "@/components/auth/auto-open-signin"

export default function Home() {
  return (
    <main className="min-h-screen">
      <AutoOpenSignin />
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <WhyItWorks />
      <ComparisonSection />
      <CTABanner />
      <Footer />
    </main>
  )
}
