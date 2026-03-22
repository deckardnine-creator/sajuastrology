import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect birth date, time, and location data that you voluntarily provide to generate your Saju reading. If you sign in with Google, we receive your name and email address.",
  },
  {
    title: "How We Use Your Data",
    content:
      "Your birth data is used solely to calculate your Saju reading. We do not sell or share your personal data with third parties.",
  },
  {
    title: "Data Storage",
    content:
      "Your reading data is stored locally on your device (localStorage). We do not store your birth data on our servers unless you create an account.",
  },
  {
    title: "Cookies",
    content:
      "We use essential cookies for site functionality. No tracking cookies are used.",
  },
  {
    title: "Your Rights",
    content:
      "You can delete your data at any time by clearing your browser data or using the Settings page.",
  },
  {
    title: "Contact",
    content:
      "For privacy inquiries, contact privacy@sajuastrology.com",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Privacy Policy
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
