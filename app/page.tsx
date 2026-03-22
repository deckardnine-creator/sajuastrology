import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { SocialProof } from "@/components/landing/social-proof"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ComparisonSection } from "@/components/landing/comparison-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { GuestbookLanding } from "@/components/guestbook/guestbook"
import { CTABanner } from "@/components/landing/cta-banner"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <HowItWorks />
      <ComparisonSection />
      <FeaturesSection />
      <GuestbookLanding />
      <CTABanner />
      <Footer />
    </main>
  )
}
