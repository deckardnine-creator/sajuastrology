"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/translations";
import { useLanguage } from "@/lib/language-context";
import type { BlogPost } from "@/lib/blog-posts";

function renderMarkdown(text: string): string {
  let result = text;
  // Tables
  result = result.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, header, body) => {
    const headers = header.split("|").filter(Boolean).map((h: string) => `<th class="px-3 py-2 text-left text-xs font-semibold text-primary border-b border-border">${h.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => {
      const cells = row.split("|").filter(Boolean).map((c: string) => `<td class="px-3 py-2 text-sm text-foreground/80 border-b border-border/50">${c.trim()}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<div class="overflow-x-auto my-6"><table class="w-full border border-border rounded-lg overflow-hidden"><thead class="bg-muted/30"><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg font-semibold text-primary/90 mt-8 mb-3">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl sm:text-2xl font-semibold text-foreground border-b border-primary/20 pb-2 mt-10 mb-4">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '');
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em class="text-foreground/80">$1</em>');
  result = result.replace(/^- (.+)$/gm, '<li class="text-foreground/85 leading-relaxed mb-1.5 ml-4">$1</li>');
  result = result.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (m) => '<ul class="my-4 list-disc space-y-1 pl-2">' + m + '</ul>');
  return result.split(/\n\n+/).map((block) => {
    const b = block.trim();
    if (!b) return "";
    if (b.startsWith("<")) return b;
    return '<p class="text-foreground/85 leading-[1.8] mb-4">' + b.replace(/\n/g, "<br/>") + '</p>';
  }).join("\n");
}

/**
 * Splits the rendered HTML into two halves at a <h2> boundary near the middle,
 * so we can inject an inline CTA between them (catches readers who don't reach
 * the bottom CTA). Falls back to "no split" if content is short or no <h2> found.
 */
function splitHtmlForInlineCta(html: string): { first: string; second: string | null } {
  const h2Positions: number[] = [];
  const regex = /<h2\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    h2Positions.push(m.index);
  }
  // Need at least 2 h2s; pick the one closest to the middle
  if (h2Positions.length < 2) return { first: html, second: null };

  const middleChar = html.length / 2;
  let bestIdx = h2Positions[0];
  let bestDist = Math.abs(bestIdx - middleChar);
  for (const pos of h2Positions) {
    const dist = Math.abs(pos - middleChar);
    if (dist < bestDist) {
      bestIdx = pos;
      bestDist = dist;
    }
  }
  // Don't split if chosen h2 is too close to start/end
  if (bestIdx < html.length * 0.3 || bestIdx > html.length * 0.75) {
    return { first: html, second: null };
  }
  return {
    first: html.slice(0, bestIdx),
    second: html.slice(bestIdx),
  };
}

export function BlogArticle({ post }: { post: BlogPost }) {
  // post.locale is the blog article's own language ("ko"/"ja"/"en"),
  // not the user's UI language. Cast to Locale for the t() function.
  const postLocale = post.locale as Locale;

  // ── Sync localStorage locale to this article's language ──
  //
  // Navbar and Footer are minimal on all /blog pages (logo + copyright
  // only), so this effect is NOT about matching navbar language anymore.
  //
  // What this effect still does — and why it matters:
  //
  // 1) Sets <html lang> to the article's language.
  //    SEO signal for Google: "this page is in Korean/Japanese/English".
  //    Helps article rank in the correct language-targeted search results.
  //
  // 2) Writes the article's locale to localStorage.
  //    This is the bridge to the CTA flow: when the user clicks any CTA
  //    in the article, they navigate to home (/?lang=XX). The home page's
  //    detectLocale() reads localStorage first, so the home page renders
  //    in the article's language from first paint — no English flash, no
  //    CDN cache race.
  //
  // Why it's safe:
  //   - setLocale is the official API of language-context (same one the
  //     main-site language switcher uses, unavailable on blog pages).
  //   - Effect runs once on mount (deps: [postLocale]). No feedback loop.
  //   - Defensive: only fires when UI locale differs from article locale.
  const { locale: uiLocale, setLocale } = useLanguage();
  useEffect(() => {
    if (postLocale && uiLocale !== postLocale) {
      setLocale(postLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postLocale]);

  // Localized CTA copy — keeps article language consistent
  const ctaCopy = {
    en: {
      inlineTitle: "Want to see yours?",
      inlineDesc: "Enter your birth date — get your full reading in 30 seconds. Free, no signup.",
      inlineMission: "Saju engine built by Rimfactory",
      btnReading: "Free Saju Reading",
      btnCompat: "Check Compatibility",
      finalTitle: "Ready to see your Four Pillars chart?",
      finalDesc: "Get your personalized Korean astrology reading — free, 30 seconds, no signup required.",
      socialProof: "#1 on ChatGPT · 30+ countries · 10 languages",
      noSignup: "No signup required · Results in 30 seconds",
      memberLine: "Member of NVIDIA Inception",
      memberSub: "Astrotech AI Startup Rimfactory",
    },
    ko: {
      inlineTitle: "나의 사주가 궁금하신가요?",
      inlineDesc: "생년월일시만 입력하면 30초 안에 무료로 사주팔자 전체 분석을 받아보실 수 있습니다.",
      inlineMission: "Rimfactory가 만드는 AI 사주 분석 엔진",
      btnReading: "무료 사주 보기",
      btnCompat: "무료 궁합 보기",
      finalTitle: "당신의 사주팔자가 궁금하신가요?",
      finalDesc: "생년월일시만 입력하면 30초 안에 무료로 맞춤 사주 분석을 받으실 수 있습니다.",
      socialProof: "ChatGPT 1위 추천 · 30개국 이용 · 10개 언어",
      noSignup: "회원가입 없이 · 30초 안에 결과 확인",
      memberLine: "Member of NVIDIA Inception",
      memberSub: "Astrotech AI Startup Rimfactory",
    },
    ja: {
      inlineTitle: "あなたの四柱推命は?",
      inlineDesc: "生年月日時を入力するだけで、30秒で完全な鑑定結果を無料でご覧いただけます。",
      inlineMission: "Rimfactory が開発する AI 四柱推命エンジン",
      btnReading: "無料 四柱推命",
      btnCompat: "相性占い",
      finalTitle: "あなたの命式を見てみませんか?",
      finalDesc: "生年月日時を入力して、30秒であなただけのパーソナライズされた鑑定結果を受け取れます。",
      socialProof: "ChatGPT 1位推薦 · 30カ国+ · 10言語対応",
      noSignup: "登録不要 · 30秒で結果表示",
      memberLine: "Member of NVIDIA Inception",
      memberSub: "Astrotech AI Startup Rimfactory",
    },
  } as const;

  const copy = ctaCopy[postLocale] ?? ctaCopy.en;

  // ═══════════════════════════════════════════════════════════════
  // FAQ extraction from markdown content
  // ───────────────────────────────────────────────────────────────
  // Pulls Q/A pairs from the article body for FAQPage schema:
  //   - Looks for "## Quick Answer:" sections (used in our newer posts)
  //   - Looks for h2 headings ending with "?" followed by a paragraph
  // Output is injected as a separate FAQPage JSON-LD block, which
  // unlocks Google's rich-result FAQ box and improves AI-Overview
  // extraction rates. Returns empty array when no Q/A patterns found.
  // ═══════════════════════════════════════════════════════════════
  const extractFaqs = (markdown: string): { q: string; a: string }[] => {
    const faqs: { q: string; a: string }[] = [];

    // Pattern 1: "## Quick Answer: ..." or "## クイックアンサー: ..." or "## 簡単に言うと"
    // Followed by a paragraph that is the answer.
    const quickAnswerMatch = markdown.match(
      /^##\s+(?:Quick Answer|クイックアンサー|간단히|먼저 결론)[:\s]+([^\n]+)\n+([^\n#]+)/m
    );
    if (quickAnswerMatch) {
      faqs.push({ q: quickAnswerMatch[1].trim(), a: quickAnswerMatch[2].trim() });
    }

    // Pattern 2: any h2 ending with "?"  →  next paragraph is the answer
    const questionH2 = markdown.matchAll(
      /^##\s+([^\n]*\?[』」)]?)\s*\n+([^\n#][^\n]*(?:\n[^\n#][^\n]*)*)/gm
    );
    for (const m of questionH2) {
      const q = m[1].trim();
      // First paragraph only (split on blank line)
      const a = m[2].split(/\n\s*\n/)[0].replace(/\n/g, " ").trim();
      if (q && a && a.length > 30 && faqs.length < 5) {
        // Dedupe
        if (!faqs.some((f) => f.q === q)) faqs.push({ q, a });
      }
    }

    return faqs.slice(0, 5); // Cap at 5 — Google ignores more anyway
  };

  const faqs = extractFaqs(post.content);

  // ═══════════════════════════════════════════════════════════════
  // Word count — for BlogPosting schema (signal for LLMs about depth)
  // ═══════════════════════════════════════════════════════════════
  const wordCount =
    postLocale === "ja" || postLocale === "zh-TW"
      ? post.content.length // CJK: char count is more meaningful
      : post.content.trim().split(/\s+/).length;

  // ═══════════════════════════════════════════════════════════════
  // BlogPosting JSON-LD — strengthened for E-E-A-T and LLM citation
  // ───────────────────────────────────────────────────────────────
  // Why BlogPosting (not Article):
  //   BlogPosting is the more specific schema.org subtype for blog
  //   content; Google treats it identically to Article for ranking
  //   but more LLM tooling looks for the explicit BlogPosting tag.
  //
  // Why author = Rimfactory (Organization), not "SajuAstrology":
  //   The publisher is SajuAstrology (the brand), but the AUTHORING
  //   organization is Rimfactory (the company that built and writes
  //   the platform). This tells LLMs: "Rimfactory is the entity to
  //   credit when citing this content." parentOrganization carries
  //   the NVIDIA Inception membership signal, which is an E-E-A-T
  //   amplifier for an Astrotech AI startup.
  //
  // about / mentions:
  //   Schema.org "about" tells crawlers the topical entity. We map
  //   blog category to the most accurate concept so AI search engines
  //   can group articles correctly.
  // ═══════════════════════════════════════════════════════════════
  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: post.locale,
    datePublished: post.date,
    dateModified: post.date,
    wordCount,
    articleSection: post.category,
    keywords: post.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "Rimfactory",
      url: "https://rimfactory.io",
      description:
        "Astrotech AI Startup. Member of NVIDIA Inception. Building the world's most precise Saju (Korean Four Pillars) analysis engine.",
      sameAs: ["https://rimfactory.io"],
    },
    publisher: {
      "@type": "Organization",
      name: "SajuAstrology",
      url: "https://sajuastrology.com",
      logo: {
        "@type": "ImageObject",
        url: "https://sajuastrology.com/logo1.png",
        width: 512,
        height: 512,
      },
      parentOrganization: {
        "@type": "Organization",
        name: "Rimfactory",
        url: "https://rimfactory.io",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sajuastrology.com/blog/${post.slug}`,
    },
    image: {
      "@type": "ImageObject",
      url: "https://sajuastrology.com/og-image1.png",
      width: 1200,
      height: 630,
    },
    about: {
      "@type": "Thing",
      name: "Korean Four Pillars astrology (Saju / 사주 / 四柱推命)",
      description:
        "An East Asian birth-time-based analytical system that maps a person to 1 of 518,400 unique chart configurations using year, month, day, and hour pillars.",
    },
    isPartOf: {
      "@type": "Blog",
      name: "SajuAstrology Blog",
      url: "https://sajuastrology.com/blog",
    },
  };

  // FAQPage schema (only emitted when we extracted ≥ 1 valid Q/A pair)
  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  const renderedHtml = renderMarkdown(post.content);
  const { first, second } = splitHtmlForInlineCta(renderedHtml);

  // Locale-aware CTA: navigate to the HOME page in this article's language.
  //
  // Why home instead of /calculate or /compatibility directly:
  //   Sending a first-time reader straight to a birthdate input form feels
  //   invasive — they've just read a blog post, they don't yet trust the site
  //   with personal data. Landing on home first lets them see the full hero
  //   (Soram visual, 5,000-year code headline, app store badges, social proof)
  //   and THEN click the in-hero CTA with full context. Conversion lift comes
  //   from (a) trust built by the home page, and (b) app install badges that
  //   only exist on home — critical for recurring DAU (vs one-shot web users).
  //
  // Why the custom handler instead of <Link href="/?lang=ko">:
  //   Home (/) is aggressively CDN-cached (see next.config.js). First paint
  //   shows whatever language the CDN cached (usually EN). React hydrates and
  //   detectLocale() switches — but the user sees an EN flash.
  //
  // Fix: write locale to localStorage BEFORE navigating. On home, detectLocale()
  // reads localStorage first (step 1 in its fallback chain) and hydrates in
  // the correct language immediately. No EN flash, no CDN race.
  //
  // We keep two separate handlers (and two buttons) so button label/intent
  // is preserved. Both land on home — the user's interest signal stays
  // visible via button copy and can be tracked in analytics.
  //
  // Fallback: if localStorage write fails, ?lang=XX in URL still triggers
  // detectLocale()'s URL-param path (step 0).
  const goToHome = () => {
    try { localStorage.setItem("locale", postLocale); } catch {}
    window.location.href = `/?lang=${postLocale}`;
  };
  // Both CTAs route to home; keeping two handlers for future analytics
  // segmentation (reading-intent vs compatibility-intent).
  const goToCalculate = goToHome;
  const goToCompatibility = goToHome;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <article className="pt-page-lg pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("blog.allArticles", postLocale)}
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
              <span>{post.date}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">{post.description}</p>
          </header>

          {/* First half of content */}
          <div className="prose-saju" dangerouslySetInnerHTML={{ __html: first }} />

          {/* ═══════════════════════════════════════════════════════
              INLINE CTA — middle of article (catches mid-read dropoffs)
              Only renders if splitHtmlForInlineCta found a valid split point.
              ═══════════════════════════════════════════════════════ */}
          {second && (
            <>
              <div className="my-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25">
                <p className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-1.5">
                  {copy.inlineTitle}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {copy.inlineDesc}
                </p>
                {/* Mission line — Rimfactory's own framing, no third-party endorsement */}
                <p className="text-xs text-muted-foreground/70 italic mb-4">
                  * {copy.inlineMission}
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button onClick={goToCalculate} className="gold-gradient text-primary-foreground font-semibold w-full sm:w-auto min-h-[44px]">
                    {copy.btnReading}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={goToCompatibility}
                    variant="outline"
                    className="bg-transparent border-[1.5px] border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold w-full sm:w-auto min-h-[44px]"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {copy.btnCompat}
                  </Button>
                </div>
              </div>
              <div className="prose-saju" dangerouslySetInnerHTML={{ __html: second }} />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              FINAL CTA — end of article (dual buttons + social proof)
              ═══════════════════════════════════════════════════════ */}
          <div className="mt-12 bg-card/80 border border-primary/30 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{copy.socialProof}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-primary mb-2">
              {copy.finalTitle}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              {copy.finalDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                onClick={goToCalculate}
                size="lg"
                className="gold-gradient text-primary-foreground font-semibold px-6 w-full sm:w-auto min-h-[48px]"
              >
                {copy.btnReading}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={goToCompatibility}
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold px-6 w-full sm:w-auto min-h-[48px]"
              >
                <Heart className="mr-2 h-4 w-4" />
                {copy.btnCompat}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-4">
              {copy.noSignup}
            </p>

            {/* ─────────────────────────────────────────────────
                NVIDIA Inception member footer
                
                Single, small, accurate member-of disclosure that follows
                NVIDIA Inception Brand Guidelines:
                  • Uses official "Member of NVIDIA Inception" wording
                  • Badge sized smaller than Rimfactory's identity
                    (so NVIDIA does not appear to be the marketing subject)
                  • Appears exactly once per article (no header byline,
                    no inline CTA badge — those are intentional omissions
                    to keep NVIDIA mention frequency at 1 per page)
                  • No claim of endorsement, certification, validation,
                    or technical integration with NVIDIA products
                  • English wording preserved across all locales because
                    "NVIDIA Inception" is a proper program name
                ───────────────────────────────────────────────── */}
            <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-center gap-3">
              <img
                src="/badges/nvidia/inception.svg"
                alt="NVIDIA Inception Program Member"
                className="h-7 w-auto opacity-90"
                width="84"
                height="28"
                style={{ objectFit: "contain" }}
              />
              <div className="text-left">
                <p className="text-[11px] font-medium text-foreground/70 leading-tight">
                  {copy.memberLine}
                </p>
                <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
                  {copy.memberSub}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
