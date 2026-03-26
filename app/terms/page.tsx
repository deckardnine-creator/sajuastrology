import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata = {
  title: "Terms of Service",
  description: "SajuAstrology.com terms of service.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">1. Agreement</h2>
              <p>
                By using SajuAstrology.com (&quot;the Service&quot;), you agree to these Terms.
                The Service is operated by Rimfactory (Reg. No. 402-44-01247), Seoul, Korea.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">2. Service Description</h2>
              <p>
                SajuAstrology provides personalized readings based on Korean Saju (Four Pillars of Destiny, 사주팔자)
                principles, generated with AI technology. This includes free readings, premium paid readings,
                and master consultation sessions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">3. Important Disclaimer</h2>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p>
                  Saju readings are for <strong>entertainment and self-reflection only</strong>.
                  They are based on traditional Eastern philosophy interpreted through AI and are not professional advice.
                </p>
                <p className="mt-2">
                  <strong>Do not</strong> make financial, medical, legal, or relationship decisions based solely on readings.
                  Always consult qualified professionals.
                </p>
                <p className="mt-2">
                  Rimfactory disclaims all liability for decisions or outcomes resulting from reliance on our readings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">4. Accounts</h2>
              <p>
                Basic features work without an account. Sign in with Google to save readings.
                You must be at least 13 years old to create an account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">5. Pricing</h2>
              <p className="mb-2">
                <strong>Free Reading:</strong> Personality analysis, year forecast, and elemental guidance at no cost.
              </p>
              <p className="mb-2">
                <strong>Premium Reading ($9.99 one-time):</strong> Career, love, health, 10-year forecast,
                6-month energy flow, and hidden talent analysis for one reading.
              </p>
              <p className="mb-2">
                <strong>Master Consultation ($29.99 one-time):</strong> 5 personalized consultation sessions
                for specific life questions.
              </p>
              <p className="text-muted-foreground">All prices in USD. Subject to change with notice.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">6. Payments &amp; Refunds</h2>
              <p>
                Payments are processed by Stripe. Due to the instant digital nature of the Service,
                all sales are generally final. For technical issues preventing content delivery,
                contact <a href="mailto:info@rimfactory.co.kr" className="text-primary hover:underline">info@rimfactory.co.kr</a> within
                7 days of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">7. AI-Generated Content</h2>
              <p>
                Readings are generated using artificial intelligence. While grounded in Saju principles,
                AI content may contain inaccuracies. Each reading is unique and may differ across sessions
                for the same birth data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">8. Intellectual Property</h2>
              <p>
                All Service content and technology is owned by Rimfactory.
                You may share your personal readings via the share link.
                Reproduction, resale, or reverse-engineering of the Service is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Rimfactory shall not be liable for any indirect,
                incidental, or consequential damages. Total liability shall not exceed the amount paid
                in the 12 months preceding a claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">10. Governing Law</h2>
              <p>These terms are governed by the laws of the Republic of Korea. Disputes shall be resolved in Seoul courts.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Contact</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p><strong>Rimfactory</strong></p>
                <p className="text-muted-foreground mt-1">243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea</p>
                <p className="mt-2">Email: <a href="mailto:info@rimfactory.co.kr" className="text-primary hover:underline">info@rimfactory.co.kr</a></p>
                <p>Phone: <a href="tel:+821046486793" className="text-primary hover:underline">+82-10-4648-6793</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
