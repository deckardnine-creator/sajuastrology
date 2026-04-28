import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata = {
  title: "Privacy Policy",
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-page pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: 28 April 2026</p>
          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">1. Who We Are (Data Controller)</h2>
              <p className="mb-2">SajuAstrology (the &ldquo;Service&rdquo;) is operated by <strong>Rimfactory</strong>, a business entity registered in the Republic of Korea.</p>
              <div className="bg-card/50 border border-border rounded-xl p-4 text-xs">
                <p><strong>Business name:</strong> Rimfactory</p>
                <p><strong>Representative:</strong> Yun Choyeon</p>
                <p><strong>Business Registration No.:</strong> 402-44-01247</p>
                <p><strong>Mail-order Business Report No.:</strong> 2025-Seoul Guro-2056</p>
                <p><strong>Address:</strong> 243, 1F, Sindorim Technomart, 97 Saemal-ro, Guro-gu, Seoul 08213, Republic of Korea</p>
                <p><strong>Email:</strong> <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">info@rimfactory.io</a></p>
                <p><strong>Phone:</strong> +82-10-4648-6793</p>
              </div>
              <p className="mt-2">For the purposes of the EU General Data Protection Regulation (&ldquo;GDPR&rdquo;), the UK GDPR, Korea&rsquo;s Personal Information Protection Act (&ldquo;PIPA&rdquo;), and the California Consumer Privacy Act as amended by the CPRA (&ldquo;CCPA&rdquo;), Rimfactory is the <strong>data controller</strong> (or &ldquo;business&rdquo; under CCPA) responsible for your personal information. All privacy-related inquiries should be directed to <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">info@rimfactory.io</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">2. Information We Collect</h2>
              <p className="mb-2"><strong>Account information.</strong> When you sign in via Google OAuth or Apple Sign-in, we receive your name, email address, and (when provided) profile picture. We never receive or store your password. If you use Apple&rsquo;s Hide My Email option, we use the relay address provided.</p>
              <p className="mb-2"><strong>Birth data.</strong> Name, gender, date and time of birth, and city of birth that you voluntarily enter for Saju readings, compatibility checks, and consultations. Because this combination can identify a natural person, we treat it as personal data under GDPR/PIPA and apply appropriate safeguards.</p>
              <p className="mb-2"><strong>Soram conversation data.</strong> If you use the Soram chat feature, your questions and Soram&rsquo;s responses are stored in your account so you can review them on the dashboard and so Soram can remember context across sessions. We may also generate a periodic short summary of recurring themes from your conversations to improve continuity. You can delete this history at any time by deleting your account.</p>
              <p className="mb-2"><strong>Subscription state (Soram Companion).</strong> If you subscribe, we store the subscription start/end dates, current status (active/canceled/expired), and the platform that processes the subscription (PayPal / Apple App Store / Google Play). We do not store your payment card.</p>
              <p className="mb-2"><strong>Usage and device data.</strong> Pages visited, features used, interactions, device type, operating system, browser type, approximate location (inferred from IP at country/city level), and performance telemetry. Collected via Google Analytics 4, Mixpanel (web), Firebase Analytics (mobile app), and Vercel Analytics.</p>
              <p className="mb-2"><strong>Purchase data.</strong> Transaction identifiers, product IDs, purchase timestamps, and platform (web / iOS / Android). Full payment-card data is never received or stored by us — it is handled by PayPal (web) or Apple / Google (mobile app).</p>
              <p><strong>Communications.</strong> Any email you send to us (including support requests).</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">3. Why We Use Your Data (Purposes and Legal Basis)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-3">Purpose</th>
                      <th className="text-left py-2 pr-3">Data Used</th>
                      <th className="text-left py-2">Legal Basis (GDPR/PIPA)</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/80">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Create and maintain your account</td>
                      <td className="py-2 pr-3">Account info</td>
                      <td className="py-2">Performance of contract</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Generate Saju readings, compatibility, consultations</td>
                      <td className="py-2 pr-3">Birth data</td>
                      <td className="py-2">Performance of contract; your consent</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Provide Soram chat with cross-session memory</td>
                      <td className="py-2 pr-3">Soram conversation data + birth data</td>
                      <td className="py-2">Performance of contract</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Process payments, detect fraud</td>
                      <td className="py-2 pr-3">Purchase data</td>
                      <td className="py-2">Performance of contract; legitimate interest</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Provide dashboard, daily fortune, history</td>
                      <td className="py-2 pr-3">Account + birth + usage</td>
                      <td className="py-2">Performance of contract</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Improve Service, debug issues, measure funnels</td>
                      <td className="py-2 pr-3">Usage and device data</td>
                      <td className="py-2">Legitimate interest</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-3">Comply with legal obligations, resolve disputes</td>
                      <td className="py-2 pr-3">As relevant</td>
                      <td className="py-2">Legal obligation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">We do <strong>not</strong> use your personal data for profiling that produces legal or similarly significant effects on you, for automated decisions other than generating AI readings you have explicitly requested, or for advertising or ad-targeting.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">4. AI Processing of Your Birth Data</h2>
              <p className="mb-2">Your birth data is transmitted to Google Gemini (via Google&rsquo;s generative AI APIs) and to Anthropic Claude (fallback and verification) as prompt input to generate your reading. These providers act as our data processors.</p>
              <p>We do not knowingly submit your birth data to these providers for the purpose of training their foundation models. For the providers&rsquo; own data-handling and retention practices, please refer to their respective privacy policies, which govern their processing of the input they receive. We monitor these policies and will update this notice materially if they change in a way that affects your rights.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">5. Sharing and Third-Party Processors</h2>
              <p className="mb-2">We share personal data only with the following categories of processors and partners, under written data-processing agreements where required by law:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Identity providers:</strong> Google (OAuth), Apple (Sign-in).</li>
                <li><strong>Database and infrastructure:</strong> Supabase (authentication, relational storage with Row Level Security), Vercel (web hosting and edge delivery).</li>
                <li><strong>AI model providers:</strong> Google (Gemini API), Anthropic (Claude).</li>
                <li><strong>Payment processors:</strong> PayPal (web), Apple App Store (iOS), Google Play (Android).</li>
                <li><strong>Analytics:</strong> Google Analytics 4, Mixpanel, Firebase Analytics (mobile), Vercel Analytics.</li>
                <li><strong>Error and performance monitoring:</strong> Vercel, and limited logging within our own infrastructure.</li>
              </ul>
              <p className="mt-2">We do not sell your personal information in the traditional sense, and we do not &ldquo;share&rdquo; it for cross-context behavioural advertising as defined by the CCPA/CPRA.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">6. International Data Transfers</h2>
              <p>The Service is operated from the Republic of Korea, and our processors are located in the United States, the European Union, and other jurisdictions. When we transfer personal data internationally, we rely on lawful transfer mechanisms such as the European Commission&rsquo;s Standard Contractual Clauses, Korea&rsquo;s cross-border transfer provisions under PIPA, and the adequacy decisions of the receiving jurisdictions where applicable.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">7. Retention</h2>
              <p className="mb-2">We keep your personal data only as long as necessary for the purposes described:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account, readings, and Soram conversation history:</strong> until you delete your account (30 days to complete deletion).</li>
                <li><strong>Subscription state (Soram Companion):</strong> retained while the subscription is active and for up to 5 years after termination, in line with Korean commercial and tax law, in a minimized form.</li>
                <li><strong>Contract and payment records:</strong> up to 5 years as required by Korean commercial and tax law (Act on the Consumer Protection in Electronic Commerce, Art. 6), in a minimized form.</li>
                <li><strong>Records of consumer complaints or disputes:</strong> up to 3 years.</li>
                <li><strong>Analytics:</strong> up to 14 months (Google Analytics 4 default) or 12 months (Mixpanel), then deleted or aggregated.</li>
                <li><strong>Logs and security events:</strong> up to 90 days, unless required longer for investigation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">8. Security</h2>
              <p>All connections are encrypted via HTTPS/TLS. Account credentials never reach our servers — authentication is delegated to Google OAuth and Apple Sign-in. Database access is protected with Row Level Security, access controls, and network restrictions. Despite these measures, no internet service can guarantee absolute security; we encourage you to use strong and unique authentication with your identity provider.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">9. Your Rights</h2>
              <p className="mb-2">Depending on where you live, you may have some or all of the following rights:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access and portability</strong> — request a copy of the personal data we hold about you in a structured, commonly used format.</li>
                <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Deletion / &ldquo;right to be forgotten&rdquo;</strong> — delete your account and personal data at any time from your dashboard, or by emailing us.</li>
                <li><strong>Restriction and objection</strong> — object to or restrict certain processing based on legitimate interest.</li>
                <li><strong>Withdrawal of consent</strong> — where we rely on consent, you may withdraw it at any time without affecting processing that already took place.</li>
                <li><strong>Complaint</strong> — lodge a complaint with your data-protection authority. EU/EEA residents may contact their local DPA; UK residents may contact the ICO; Korean residents may contact the Personal Information Protection Commission (PIPC); California residents may contact the California Privacy Protection Agency (CPPA).</li>
                <li><strong>California residents (CCPA/CPRA)</strong> — the right to know, delete, correct, and limit use of sensitive personal information; and the right not to be discriminated against for exercising these rights. We do not sell or share personal information for cross-context behavioural advertising.</li>
              </ul>
              <p className="mt-2">To exercise any right, email <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">info@rimfactory.io</a>. We will respond within 30 days (or as legally required). Primary support language is English.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">10. Children</h2>
              <p>The Service is not intended for children under the age of 14 (the minimum digital-consent age under Korea&rsquo;s PIPA). EU/EEA residents must meet their member state&rsquo;s minimum digital-consent age (generally 16). We do not knowingly collect personal data from children below these ages. If you believe a child has submitted data, contact us and we will delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">11. Cookies and Similar Technologies</h2>
              <p>We use a minimal set of cookies and local-storage items required to keep you signed in, remember your language, and measure product usage. Vercel Analytics is cookieless. Google Analytics, Mixpanel, and Firebase may set analytics cookies or use localStorage to generate anonymous identifiers. PayPal may set essential cookies during checkout. You can control cookies via your browser settings; disabling non-essential cookies will not prevent use of the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">12. Important Disclaimer</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p>All readings, compatibility results, daily fortunes, and consultations are <strong>for entertainment and self-reflection only</strong>. They are not professional, medical, legal, financial, or psychological advice. Do not make important life decisions based solely on the content of the Service. See Terms §3 for the full disclaimer.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">13. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will announce material changes on the Website with an updated &ldquo;Last updated&rdquo; date, and, where required by law, via email. Continued use of the Service after changes means you accept the updated policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-serif text-primary mb-3">Contact</h2>
              <div className="bg-card/50 border border-border rounded-xl p-4">
                <p><strong>Rimfactory</strong> — 243, 1F, Sindorim Technomart, 97 Saemal-ro, Guro-gu, Seoul 08213, Republic of Korea</p>
                <p className="mt-1">Business Registration No.: 402-44-01247 · Mail-order Business Report No.: 2025-Seoul Guro-2056</p>
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
