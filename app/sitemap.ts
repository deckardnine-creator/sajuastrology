import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog-posts";

const BASE = "https://sajuastrology.com";

// ═══════════════════════════════════════════════════════════════════
// Languages published in translations.ts. Expand this list whenever a
// new locale gets real translation data injected.
//
// The sitemap now emits ONE canonical URL per path plus ONE alternate
// per locale with ?lang=<code> appended, so each language version is
// a distinct URL from Google's perspective. That matters because the
// app uses client-side locale switching via localStorage — without a
// query param, every language would share the same URL and Google
// would (correctly) collapse them into one indexed page.
//
// Path-based routing (/es/, /ko/, …) would score a few SEO points
// higher, but query-param hreflang is a recognized Google pattern
// and unblocks multilingual indexing today without rewriting every
// route. See:
//   https://developers.google.com/search/docs/specialty/international/localized-versions
// ═══════════════════════════════════════════════════════════════════
const PUBLISHED_LOCALES = [
  "en",
  "ko",
  "ja",
  "es",
  "fr",
  "pt",
  "zh-TW",
  "ru",
  "hi",
  "id",
] as const;

// Build an alternates map:
//   {
//     "x-default": "https://sajuastrology.com/",
//     en:          "https://sajuastrology.com/",
//     ko:          "https://sajuastrology.com/?lang=ko",
//     ja:          "https://sajuastrology.com/?lang=ja",
//     ...
//   }
// - `x-default` and `en` share the canonical URL (no ?lang=)
//   because English IS the default that language-context falls back to.
// - Other locales get the query parameter, which language-context reads
//   on mount (via URLSearchParams) and writes to localStorage so the
//   user's preferred locale persists across subsequent navigations.
function withHreflang(path: string): Record<string, string> {
  const canonical = `${BASE}${path}`;
  const alternates: Record<string, string> = {
    "x-default": canonical,
  };
  for (const loc of PUBLISHED_LOCALES) {
    // English is the canonical (no ?lang=) because that's what
    // navigator.language ?? "en" will render by default.
    alternates[loc] =
      loc === "en" ? canonical : `${canonical}?lang=${loc}`;
  }
  return alternates;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // ─── Group A: Content / funnel-entry pages (multilingual SEO) ──────
  // These pages get hreflang alternates so each search locale can
  // discover the appropriate language version.
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
    {
      url: `${BASE}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: withHreflang("/pricing") },
    },
    {
      url: `${BASE}/consultation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: withHreflang("/consultation") },
    },
    {
      url: `${BASE}/daily`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: { languages: withHreflang("/daily") },
    },
  ];

  // ─── Group B: Transaction / execution pages (English-only SEO) ─────
  // No hreflang here: these aren't content pages, they're app flows.
  const groupB: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${BASE}/my`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ─── Blog posts — each post is multilingual content, follows Group A pattern
  const blogPosts: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: { languages: withHreflang(`/blog/${slug}`) },
  }));

  return [...groupA, ...groupB, ...blogPosts];
}
