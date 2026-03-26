import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata = {
  title: "Privacy Policy",
  description: "SajuAstrology.com privacy policy — how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Who We Are</h2>
              <p>
                SajuAstrology.com is operated by <strong>Rimfactory</strong> (Business Registration No. 402-44-01247),
                243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea. CEO: Chandler Yun.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Information We Collect</h2>
              <p className="mb-2">
                <strong>Account Information:</strong> When you sign in with Google, we receive your name, email address,
                and profile picture. We do not receive or store your Google password.
              </p>
              <p className="mb-2">
                <strong>Birth Data:</strong> Name, gender, date of birth, birth time (optional), and birth city
                that you voluntarily enter. This data is stored to provide your personalized reading.
              </p>
              <p className="mb-2">
                <strong>Payment Information:</strong> Processed entirely by Stripe.
                We do not store credit card numbers or financial information.
                We only receive payment confirmation and your email for receipts.
              </p>
              <p>
                <strong>Usage Data:</strong> We use Vercel Analytics to collect anonymous statistics
                (page views, device type, country). No personal data is included.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">How We Use Your Information</h2>
              <p>
                Your information is used solely to generate and store your Saju readings,
                provide your dashboard and consultation history, process payments through Stripe,
                and improve our service based on anonymous usage patterns.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Data Storage &amp; Security</h2>
              <p>
                Data is stored on Supabase (PostgreSQL) with Row Level Security enabled.
                All connections use HTTPS encryption.
                Authentication is handled through Supabase Auth with Google OAuth 2.0.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Third-Party Services</h2>
              <p>
                We use <strong>Google OAuth</strong> for authentication, <strong>Supabase</strong> for data storage,
                <strong> Stripe</strong> for payment processing, <strong>Vercel</strong> for hosting and analytics,
                and <strong>Anthropic Claude API</strong> for AI-generated reading content.
                Each has their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Cookies</h2>
              <p>
                We use essential cookies only for authentication session management.
                No advertising or third-party tracking cookies. Vercel Analytics is cookie-free.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Your Rights</h2>
              <p>
                You may access your data through your dashboard, request deletion of your account
                and all associated data, withdraw consent at any time, or request a portable copy
                of your data. Contact us at the email below to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Important Disclaimer</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p>
                  SajuAstrology provides readings based on traditional Korean Saju principles,
                  generated with AI technology. Readings are for <strong>entertainment and self-reflection
                  purposes only</strong> and should not be used as the sole basis for important life decisions.
                  We recommend consulting qualified professionals for financial, medical, legal, or relationship matters.
                </p>
                <p className="mt-2">
                  Rimfactory assumes no responsibility for actions taken based on our readings or consultations.
                </p>
              </div>
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
