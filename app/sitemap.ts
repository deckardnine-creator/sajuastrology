import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog-posts";

const BASE = "https://sajuastrology.com";

// Languages with actual translation data in translations.ts.
// Expand this list as new languages get translated content.
const PUBLISHED_LOCALES = ["en", "ko", "ja", "es"] as const;

// Build a { "x-default": url, en: url, ko: url, ja: url } alternates block.
// All languages point to the same URL — Next.js serves the same page and
// the client-side language switcher picks the locale from ?lang= or
// navigator.language. hreflang is what signals multilingual availability
// to search engines.
function withHreflang(path: string): Record<string, string> {
  const url = `${BASE}${path}`;
  const alternates: Record<string, string> = { "x-default": url };
  for (const loc of PUBLISHED_LOCALES) {
    alternates[loc] = url;
  }
  return alternates;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // ─── Group A: Content / funnel-entry pages (multilingual SEO) ──────
  // These pages get hreflang alternates so each search locale can
  // discover the appropriate page.
  const groupA: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: withHreflang("") },
    },
    {
      url: `${BASE}/calculate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: withHreflang("/calculate") },
    },
    {
      url: `${BASE}/what-is-saju`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: withHreflang("/what-is-saju") },
    },
    {
      url: `${BASE}/compatibility`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: withHreflang("/compatibility") },
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: withHreflang("/blog") },
    },
    {
      url: `${BASE}/letter`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: withHreflang("/letter") },
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: withHreflang("/about") },
    },
  ];

  // ─── Group B: Transaction / execution pages (English-only SEO) ─────
  // These pages are English-only on purpose: pricing and consultation
  // flows carry legal/payment nuance we don't want auto-translated.
  // Included in sitemap so Google can index them in English, but NO
  // hreflang alternates — signals to Google that these are English only.
  const groupB: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/consultation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // ─── Group C: Private / user-specific pages — excluded from sitemap ─
  // /privacy, /terms use robots meta noindex; /reading/[slug],
  // /dashboard, /daily are already disallowed in robots.ts.

  // Blog posts — each post is multilingual content, follows Group A pattern
  const blogPages: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: withHreflang(`/blog/${slug}`) },
  }));

  return [...groupA, ...groupB, ...blogPages];
}
