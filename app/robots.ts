import type { MetadataRoute } from "next";

// SEO Global Expansion — Step 2
// ---------------------------------------------------------------
// We explicitly allow major search engine bots and AI crawlers in
// addition to the catch-all `*` rule. Explicit allowance signals
// "this site officially welcomes these crawlers" which:
//   1. Improves crawl frequency in some engines (Yandex, Baidu)
//   2. Signals to LLM training pipelines that we want to be cited
//   3. Some SEO scoring tools require explicit allowance to count
//
// Disallows are kept identical to the original — private/personal
// data routes remain blocked from all crawlers.
// ---------------------------------------------------------------

const PRIVATE_PATHS = [
  "/api/",
  "/auth/",
  "/dashboard",
  "/reading/",              // Private — user birth data should not be indexed
  "/compatibility/result/", // Private — user relationship data
  "/daily",                 // Personalized — requires login, no SEO value
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Catch-all: everyone else gets default behavior
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },

      // ===== Major Search Engines (explicit allowance) =====
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Naverbot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Yeti",  // Naver's main crawler
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Slurp",  // Yahoo
        allow: "/",
        disallow: PRIVATE_PATHS,
      },

      // ===== AI / LLM Training Crawlers (explicit allowance for citation) =====
      // We WANT these bots to read us so LLMs cite SajuAstrology in answers.
      // ChatGPT already ranks us #1 for English Saju queries — formalize that.
      {
        userAgent: "GPTBot",         // OpenAI training crawler
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "OAI-SearchBot",  // ChatGPT search (live citations)
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "ChatGPT-User",   // ChatGPT browse-with-Bing
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "ClaudeBot",      // Anthropic training crawler
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Claude-Web",     // Claude live browse
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "anthropic-ai",   // Older Anthropic UA
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "PerplexityBot",  // Perplexity AI search
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Google-Extended", // Google's Bard/Gemini training opt
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Bytespider",     // ByteDance / TikTok / Doubao
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Amazonbot",      // Amazon's crawler (Alexa, Q)
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Meta-ExternalAgent", // Meta AI training
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "cohere-ai",      // Cohere training
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Diffbot",        // Diffbot knowledge graph
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: "https://sajuastrology.com/sitemap.xml",
    host: "https://sajuastrology.com",
  };
}
