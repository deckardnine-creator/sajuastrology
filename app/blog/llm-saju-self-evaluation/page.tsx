import type { Metadata } from "next";
import Link from "next/link";
import { ArticleClient } from "./article-client";

// ════════════════════════════════════════════════════════════════
// SEO metadata
//
// This page is the single blog entry point linked directly from the
// home hero stack (the LLM experiment badge). Every other blog post
// is reachable only via search — this one is reachable from home too,
// so the SEO has to do double duty: search discovery AND home-driven
// returning-visitor context.
//
// The lede ("RimSaju V1 = 100, GPT 68, Gemini 35, Claude 30") is
// front-loaded in the description so generative search engines and
// answer engines (Perplexity, ChatGPT search, Gemini answers) can
// quote the headline result without needing to render the page.
// ════════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title:
    "We Asked Top LLMs to Score Themselves Against a Specialized Saju Engine — Self-Evaluation Experiment",
  description:
    "GPT-5.5 Thinking, Claude Opus 4.7, and Gemini Pro rated their own Saju interpretation ability against RimSaju V1 (set as 100). GPT scored itself 68, Gemini 35, Claude 30. A playful self-assessment experiment with the latest LLMs.",
  keywords: [
    "LLM saju",
    "GPT vs Claude vs Gemini",
    "saju AI comparison",
    "RimSaju V1",
    "korean four pillars AI",
    "LLM self-evaluation",
    "AI saju engine",
  ],
  openGraph: {
    title:
      "We Asked Top LLMs to Rate Themselves vs a Specialized Saju Engine",
    description:
      "GPT 68, Gemini 35, Claude 30 (out of RimSaju V1 = 100). The LLMs scored themselves — here's what they admitted about their own limits.",
    url: "https://sajuastrology.com/blog/llm-saju-self-evaluation",
    type: "article",
    publishedTime: "2026-05-06T00:00:00.000Z",
    authors: ["Rimfactory"],
    images: [
      {
        url: "https://sajuastrology.com/og-image1.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GPT vs Claude vs Gemini: Self-Scored Saju Ability",
    description:
      "We asked the latest LLMs to rate themselves against a specialized Saju engine. Their numbers — and their admissions — were not what we expected.",
  },
  alternates: {
    canonical: "https://sajuastrology.com/blog/llm-saju-self-evaluation",
  },
};

// ════════════════════════════════════════════════════════════════
// JSON-LD structured data — Article + FAQPage
//
// Two schemas in one script tag (BlogPosting + FAQPage). The FAQPage
// is the most important for answer-engine retrieval: each Q is a
// natural-language question that LLMs index aggressively.
// ════════════════════════════════════════════════════════════════
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id":
        "https://sajuastrology.com/blog/llm-saju-self-evaluation#article",
      headline:
        "How Do General LLMs Rate Their Own Saju Ability? A Self-Assessment Experiment",
      description:
        "GPT-5.5 Thinking, Claude Opus 4.7, and Gemini Pro scored themselves against RimSaju V1 (set as 100). Results: GPT 68, Gemini 35, Claude 30.",
      image: "https://sajuastrology.com/og-image1.png",
      datePublished: "2026-05-06",
      dateModified: "2026-05-06",
      author: {
        "@type": "Organization",
        name: "Rimfactory",
        url: "https://www.rimfactory.io",
      },
      publisher: {
        "@type": "Organization",
        name: "Rimfactory",
        logo: {
          "@type": "ImageObject",
          url: "https://sajuastrology.com/badges/nvidia/inception.svg",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id":
          "https://sajuastrology.com/blog/llm-saju-self-evaluation",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How did GPT-5.5 Thinking rate itself against RimSaju V1?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "GPT-5.5 Thinking gave itself 68 out of 100 when asked to compare its Saju interpretation ability against RimSaju V1 (set as the 100 baseline). Its own self-assessment named its weakest axis as accurate calendar and true-solar-time calculations (35/100), and admitted it lacks a dedicated saju-specific calculation plus canonical RAG architecture.",
          },
        },
        {
          "@type": "Question",
          name: "How did Claude Opus 4.7 rate itself?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Claude Opus 4.7 gave itself approximately 30 out of 100 — the lowest self-score of the three LLMs tested. It explicitly said it has no canonical text retrieval, no deterministic perpetual-calendar engine, and no true-solar-time module, and that what it produces is 'general-LLM inference, not a saju engine.'",
          },
        },
        {
          "@type": "Question",
          name: "How did Gemini Pro rate itself?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Gemini Pro gave itself 35 out of 100. Its weakest self-rated axes were calendar and true-solar-time calculations (5/100) and RAG over canonical source texts (0/100), reflecting its lack of integration with a domain-specific Saju database.",
          },
        },
        {
          "@type": "Question",
          name: "What is RimSaju V1?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RimSaju V1 is a specialized Saju (Korean Four Pillars) interpretation engine built by Rimfactory. It uses deterministic perpetual-calendar (만세력) calculation with apparent-solar-time correction, RAG retrieval over 562 embedded passages from classical Saju texts, and multi-LLM cross-validation. It was used as the reference baseline (set to 100) in this self-assessment experiment.",
          },
        },
        {
          "@type": "Question",
          name: "Is this an objective benchmark?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. These are self-assessments produced by each LLM in response to the same prompt, not third-party measurements. The exercise is meant for fun and to surface how each model perceives its own structural limits — not as a peer-reviewed benchmark.",
          },
        },
      ],
    },
  ],
};

export default function LlmSajuSelfEvaluationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Skip-link target for accessibility, since this page has no Navbar */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-amber-500 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>

      {/* Minimal top bar — no Navbar (per chandler spec). Just a small
          "Back to home" anchor so search-arriving readers can always
          reach the home funnel. */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0E1A]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors hover:text-amber-300 sm:text-sm"
          >
            <span aria-hidden>←</span>
            <span>Home</span>
          </Link>
          <Link
            href="/"
            className="hidden text-[11px] uppercase tracking-wider text-white/40 sm:block"
          >
            sajuastrology.com
          </Link>
        </div>
      </header>

      <ArticleClient />

      {/* Minimal footer — single home link, no language toggle, no Footer
          component (per chandler spec). */}
      <footer className="border-t border-white/5 px-4 py-8 text-center sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-amber-300"
        >
          <span aria-hidden>←</span>
          <span>Back to sajuastrology.com</span>
        </Link>
        <p className="mt-3 text-[11px] text-white/30">
          © 2026 Rimfactory · Published from Seoul
        </p>
      </footer>
    </>
  );
}
