import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const sections = [
  {
    title: "Service Description",
    content:
      "SajuAstrology provides entertainment-based astrological readings derived from the Korean Four Pillars (Saju) system.",
  },
  {
    title: "Disclaimer",
    content:
      "All readings are provided for entertainment and self-reflection purposes only. They should not be considered professional advice for medical, financial, legal, or other important life decisions.",
  },
  {
    title: "Accuracy",
    content:
      "While our system uses traditional Saju calculation methods, we do not guarantee the accuracy or applicability of any reading.",
  },
  {
    title: "Account",
    content:
      "You are responsible for maintaining the security of your account.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, design, and analysis methods on SajuAstrology are proprietary.",
  },
  {
    title: "Changes",
    content:
      "We may update these terms at any time. Continued use constitutes acceptance.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: March 2026
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={index} className="glass rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
