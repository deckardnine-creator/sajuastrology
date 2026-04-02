import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>
          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Who We Are</h2>
              <p>SajuAstrology.com is operated by <strong>Rimfactory</strong> (Reg. No. 402-44-01247), 243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul, Korea. CEO: Cho Yeon Yun.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Information We Collect</h2>
              <p className="mb-2"><strong>Account:</strong> Name, email, and profile picture via Google sign-in. We never receive your Google password.</p>
              <p className="mb-2"><strong>Birth Data:</strong> Name, gender, birth date/time/city you voluntarily provide for readings, compatibility checks, and consultations.</p>
              <p className="mb-2"><strong>Payments:</strong> Processed securely by PayPal. We never store credit card numbers.</p>
              <p><strong>Analytics:</strong> Anonymous usage data via Vercel Analytics (cookie-free).</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">How We Use Your Data</h2>
              <p>Generate personalized Saju readings, compatibility analysis, and consultations, provide your dashboard and daily fortune, process payments, and improve the service via anonymous analytics.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Security</h2>
              <p>Data stored on Supabase with Row Level Security. All connections encrypted via HTTPS. Authentication via Google OAuth 2.0.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Third Parties</h2>
              <p>Google OAuth, Supabase, PayPal (payments), Vercel (hosting), Google Gemini API and Anthropic Claude API (AI readings). Each has their own privacy policies.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Cookies</h2>
              <p>We use Vercel Analytics (cookie-free). However, our payment provider, PayPal, may use essential cookies to process transactions securely.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Your Rights</h2>
              <p>Access your data via dashboard. Request deletion by contacting us. Withdraw consent anytime.</p>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Important Disclaimer</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p>Readings are for <strong>entertainment and self-reflection only</strong>. Do not make important life decisions based solely on readings. Rimfactory assumes no responsibility for actions taken based on our content.</p>
              </div>
            </section>
            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Contact</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p><strong>Rimfactory</strong> — 243, 1F, Sindorim Technomart, 97 Saemallo, Guro-gu, Seoul</p>
                <p className="mt-1">Email: <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">info@rimfactory.io</a> · Phone: +82-10-4648-6793</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
