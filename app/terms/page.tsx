// app/terms/page.tsx
// Terms of Service + Specified Commercial Transactions Act (特定商取引法) disclosure
// Required for KOMOJU cross-border merchant approval and Japan e-commerce compliance.
// URL: https://sajuastrology.com/terms
//
// Last updated: 2026-05-02

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service & Specified Commercial Transactions | SajuAstrology",
  description:
    "Terms of Service, Privacy Policy, Refund Policy, and Specified Commercial Transactions Act disclosure for SajuAstrology by Rimfactory.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://sajuastrology.com/terms" },
}

// ─── Section component ───────────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-2 border-b border-border/40">
      <span className="font-medium text-foreground/70 text-xs">{label}</span>
      <span className="text-foreground/90 text-sm">{value}</span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────
export default function TermsPage() {
  const lastUpdated = "May 2, 2026"

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-foreground/50">
            Last updated: {lastUpdated} &nbsp;·&nbsp; Effective immediately
          </p>
          <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your use of
            SajuAstrology (<a href="https://sajuastrology.com"
              className="underline text-primary">https://sajuastrology.com</a>)
            and all associated mobile applications operated by Rimfactory
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing
            or using our Service you agree to be bound by these Terms.
          </p>
        </header>

        {/* ── 1. Specified Commercial Transactions Act (特定商取引法) ── */}
        <Section id="scta" title="1. 特定商取引法に基づく表記 / Specified Commercial Transactions Act Disclosure">
          <p className="mb-4 text-xs text-foreground/60">
            This section is required under Japan&apos;s Act on Specified
            Commercial Transactions (特定商取引法) for online merchants
            providing services to customers in Japan.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <Row label="販売業者 / Seller" value="Rimfactory" />
            <Row label="代表者 / Representative" value="Chandler Cho (趙延允)" />
            <Row
              label="所在地 / Address"
              value="243, 97 Saemal-ro, Guro-gu, Seoul, Republic of Korea (08288)"
            />
            <Row
              label="電話番号 / Phone"
              value={
                <span>
                  Available upon request at{" "}
                  <a href="mailto:info@rimfactory.io" className="underline text-primary">
                    info@rimfactory.io
                  </a>
                </span>
              }
            />
            <Row
              label="メールアドレス / Email"
              value={
                <a href="mailto:info@rimfactory.io" className="underline text-primary">
                  info@rimfactory.io
                </a>
              }
            />
            <Row
              label="販売URL / Site URL"
              value={
                <a href="https://sajuastrology.com" className="underline text-primary">
                  https://sajuastrology.com
                </a>
              }
            />
            <Row label="サービス提供開始 / Service Launch" value="April 1, 2026" />
            <Row
              label="商品・サービス / Products & Services"
              value="AI-powered Saju (Four Pillars) astrology readings, compatibility analysis, and AI advisor subscription (Soram Companion)"
            />
            <Row
              label="販売価格 / Pricing"
              value={
                <ul className="list-disc pl-4 space-y-1">
                  <li>Free tier: ¥0 (1 daily Soram message included)</li>
                  <li>Compatibility Full Reading: approx. ¥450 (USD $2.99)</li>
                  <li>Soram Companion Monthly: approx. ¥750/mo (USD $4.99)</li>
                  <li>Full Destiny Reading: approx. ¥1,500 (USD $9.99)</li>
                  <li>Master 5 Consultation Pack: approx. ¥4,500 (USD $29.99)</li>
                  <li>Prices displayed in USD; JPY equivalent varies with exchange rate.</li>
                </ul>
              }
            />
            <Row
              label="支払方法 / Payment Methods"
              value="PayPal, credit/debit cards (Visa, Mastercard, AMEX) via PayPal checkout"
            />
            <Row
              label="支払時期 / Payment Timing"
              value="One-time purchases charged immediately at checkout. Subscriptions charged monthly on the renewal date."
            />
            <Row
              label="サービス提供時期 / Service Delivery"
              value="Digital services are delivered immediately upon successful payment. AI readings are generated within seconds."
            />
            <Row
              label="返品・キャンセル / Returns & Cancellations"
              value={
                <span>
                  Due to the digital and immediately delivered nature of our
                  services, refunds are generally not provided after a reading
                  has been generated. Subscription cancellations take effect at
                  the end of the current billing period. For exceptional
                  circumstances please contact{" "}
                  <a href="mailto:info@rimfactory.io" className="underline text-primary">
                    info@rimfactory.io
                  </a>
                  .
                </span>
              }
            />
            <Row
              label="動作環境 / System Requirements"
              value="Modern web browser (Chrome, Safari, Firefox, Edge) or iOS / Android mobile app. Internet connection required."
            />
            <Row
              label="その他 / Other"
              value="All content is provided in multiple languages (EN/KO/JA and others). Saju readings are for entertainment and personal reflection purposes. They do not constitute medical, legal, or financial advice."
            />
          </div>
        </Section>

        {/* ── 2. Service Description ── */}
        <Section id="service" title="2. Service Description">
          <p>
            SajuAstrology provides AI-powered analysis of Four Pillars (Saju /
            四柱推命) astrology using the RimSaju Engine, which combines
            classical Chinese and Korean astrological texts with large language
            model technology. Our services include destiny readings,
            compatibility analysis, and an AI advisor named Soram.
          </p>
          <p>
            All readings are generated by artificial intelligence and are
            intended for personal reflection and entertainment. They do not
            constitute medical, psychological, legal, or financial advice.
          </p>
        </Section>

        {/* ── 3. User Accounts ── */}
        <Section id="accounts" title="3. User Accounts">
          <p>
            You may register using Google Sign-In or Apple Sign-In. You are
            responsible for maintaining the confidentiality of your account. We
            reserve the right to terminate accounts that violate these Terms.
          </p>
          <p>
            Birth data you enter (date, time, location) is stored to provide
            personalized readings. You may request deletion of your data at any
            time by contacting us.
          </p>
        </Section>

        {/* ── 4. Payments & Refunds ── */}
        <Section id="payments" title="4. Payments & Refunds">
          <p>
            <strong>One-time purchases:</strong> Charged immediately at
            checkout. Because AI readings are generated and delivered instantly,
            completed readings are non-refundable.
          </p>
          <p>
            <strong>Subscriptions (Soram Companion):</strong> Billed monthly.
            You may cancel at any time; access continues until the end of the
            paid period. No partial-month refunds.
          </p>
          <p>
            <strong>Exceptions:</strong> If a technical error on our side
            prevented delivery, contact{" "}
            <a href="mailto:info@rimfactory.io" className="underline text-primary">
              info@rimfactory.io
            </a>{" "}
            within 7 days for a review.
          </p>
          <p>
            Prices are listed in USD. Currency conversion is handled by your
            payment provider and may vary.
          </p>
        </Section>

        {/* ── 5. Intellectual Property ── */}
        <Section id="ip" title="5. Intellectual Property">
          <p>
            All content, software, and technology on SajuAstrology — including
            the RimSaju Engine, Soram AI character, and generated readings — are
            the exclusive property of Rimfactory. You may not reproduce,
            redistribute, or commercialize any content without prior written
            consent.
          </p>
        </Section>

        {/* ── 6. Privacy ── */}
        <Section id="privacy" title="6. Privacy">
          <p>
            We collect birth data, usage analytics, and account information to
            provide our services. We do not sell your personal data to third
            parties. For detailed information please contact{" "}
            <a href="mailto:info@rimfactory.io" className="underline text-primary">
              info@rimfactory.io
            </a>
            . A full Privacy Policy will be published separately.
          </p>
          <p>
            We comply with applicable data protection laws including GDPR and
            Korea&apos;s Personal Information Protection Act (PIPA).
          </p>
        </Section>

        {/* ── 7. Disclaimer ── */}
        <Section id="disclaimer" title="7. Disclaimer of Warranties">
          <p>
            SajuAstrology is provided &quot;as is&quot; without warranties of
            any kind. We do not guarantee the accuracy, completeness, or
            fitness of AI-generated readings for any particular purpose. Use of
            our service is at your own discretion.
          </p>
        </Section>

        {/* ── 8. Limitation of Liability ── */}
        <Section id="liability" title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, Rimfactory shall
            not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of SajuAstrology. Our
            total liability shall not exceed the amount you paid in the 30 days
            preceding the claim.
          </p>
        </Section>

        {/* ── 9. Governing Law ── */}
        <Section id="law" title="9. Governing Law">
          <p>
            These Terms are governed by the laws of the Republic of Korea.
            Disputes shall be subject to the exclusive jurisdiction of the Seoul
            Central District Court, unless otherwise required by applicable
            consumer protection laws in your jurisdiction.
          </p>
        </Section>

        {/* ── 10. Contact ── */}
        <Section id="contact" title="10. Contact">
          <p>
            For any questions regarding these Terms, refund requests, or data
            deletion:
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mt-2">
            <Row label="Company" value="Rimfactory" />
            <Row label="Representative" value="Chandler Cho" />
            <Row label="Email" value={
              <a href="mailto:info@rimfactory.io" className="underline text-primary">
                info@rimfactory.io
              </a>
            } />
            <Row label="Address" value="243, 97 Saemal-ro, Goru-gu, Seoul, Republic of Korea" />
          </div>
        </Section>

        {/* Footer note */}
        <p className="text-xs text-foreground/40 mt-8 text-center">
          © 2026 Rimfactory. All rights reserved.{" "}
          SajuAstrology is a product of Rimfactory.
        </p>

      </div>
    </main>
  )
}
