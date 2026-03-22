import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { PricingCards } from "@/components/pricing/pricing-cards"
import { PricingFAQ } from "@/components/pricing/pricing-faq"

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              Choose Your <span className="gold-gradient-text">Path</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you&apos;re ready to unlock your full cosmic
              potential.
            </p>
          </div>
          <PricingCards />
          <PricingFAQ />
        </div>
      </section>
      <Footer />
    </main>
  )
}
