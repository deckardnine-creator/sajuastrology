import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BlogList } from "@/components/blog/blog-list";

export const metadata: Metadata = {
  title: "Saju Astrology Blog — Korean Four Pillars Guides & Insights",
  description: "Learn about Saju (사주), the Korean Four Pillars of Destiny. Guides on Day Masters, Five Elements, birth chart readings, love compatibility, and how Saju compares to Western astrology.",
  keywords: ["saju blog", "korean astrology guide", "four pillars explained", "bazi articles", "astrology blog"],
  openGraph: {
    title: "Saju Astrology Blog — Korean Four Pillars Guides & Insights",
    description: "Deep dives into Saju astrology. Day Masters, Five Elements, compatibility, and more.",
    url: "https://sajuastrology.com/blog",
  },
  alternates: {
    canonical: "https://sajuastrology.com/blog",
    languages: {
      "x-default": "https://sajuastrology.com/blog",
      en: "https://sajuastrology.com/blog",
      ko: "https://sajuastrology.com/blog",
      ja: "https://sajuastrology.com/blog",
    },
  },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[140px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px]" />
      </div>
      <Navbar />
      <section className="pt-page-lg pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              Saju Astrology <span className="gold-gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Guides, insights, and deep dives into the Korean Four Pillars of Destiny.
            </p>
          </div>
          <BlogList />
        </div>
      </section>
      <Footer />
    </main>
  );
}
