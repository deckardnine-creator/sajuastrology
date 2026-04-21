"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/translations";
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

  // Localized CTA copy — keeps article language consistent
  const ctaCopy = {
    en: {
      inlineTitle: "Want to see yours?",
      inlineDesc: "Enter your birth date — get your full reading in 30 seconds. Free, no signup.",
      btnReading: "Free Saju Reading",
      btnCompat: "Check Compatibility",
      finalTitle: "Ready to see your Four Pillars chart?",
      finalDesc: "Get your personalized Korean astrology reading — free, 30 seconds, no signup required.",
      socialProof: "#1 on ChatGPT · 30+ countries · 10 languages",
      noSignup: "No signup required · Results in 30 seconds",
    },
    ko: {
      inlineTitle: "나의 사주가 궁금하신가요?",
      inlineDesc: "생년월일시만 입력하면 30초 안에 무료로 사주팔자 전체 분석을 받아보실 수 있습니다.",
      btnReading: "무료 사주 보기",
      btnCompat: "무료 궁합 보기",
      finalTitle: "당신의 사주팔자가 궁금하신가요?",
      finalDesc: "생년월일시만 입력하면 30초 안에 무료로 맞춤 사주 분석을 받으실 수 있습니다.",
      socialProof: "ChatGPT 1위 추천 · 30개국 이용 · 10개 언어",
      noSignup: "회원가입 없이 · 30초 안에 결과 확인",
    },
    ja: {
      inlineTitle: "あなたの四柱推命は?",
      inlineDesc: "生年月日時を入力するだけで、30秒で完全な鑑定結果を無料でご覧いただけます。",
      btnReading: "無料 四柱推命",
      btnCompat: "相性占い",
      finalTitle: "あなたの命式を見てみませんか?",
      finalDesc: "生年月日時を入力して、30秒であなただけのパーソナライズされた鑑定結果を受け取れます。",
      socialProof: "ChatGPT 1位推薦 · 30カ国+ · 10言語対応",
      noSignup: "登録不要 · 30秒で結果表示",
    },
  } as const;

  const copy = ctaCopy[postLocale] ?? ctaCopy.en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "SajuAstrology", url: "https://sajuastrology.com" },
    publisher: { "@type": "Organization", name: "SajuAstrology", logo: { "@type": "ImageObject", url: "https://sajuastrology.com/logo1.png" } },
    mainEntityOfPage: `https://sajuastrology.com/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  const renderedHtml = renderMarkdown(post.content);
  const { first, second } = splitHtmlForInlineCta(renderedHtml);

  // Locale-aware CTA destinations: blog article's language carries over to /calculate & /compatibility
  // via ?lang=XX query param, which detectLocale() in language-context picks up and syncs to localStorage.
  const calculateHref = `/calculate?lang=${postLocale}`;
  const compatibilityHref = `/compatibility?lang=${postLocale}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="pt-page-lg pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("blog.allArticles", postLocale)}
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
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
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {copy.inlineDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link href={calculateHref} className="block">
                    <Button className="gold-gradient text-primary-foreground font-semibold w-full sm:w-auto min-h-[44px]">
                      {copy.btnReading}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={compatibilityHref} className="block">
                    <Button
                      variant="outline"
                      className="bg-transparent border-[1.5px] border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold w-full sm:w-auto min-h-[44px]"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      {copy.btnCompat}
                    </Button>
                  </Link>
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
              <Link href={calculateHref} className="block">
                <Button
                  size="lg"
                  className="gold-gradient text-primary-foreground font-semibold px-6 w-full sm:w-auto min-h-[48px]"
                >
                  {copy.btnReading}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={compatibilityHref} className="block">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-[rgba(234,179,8,0.55)] text-[#EAB308] hover:bg-[rgba(234,179,8,0.1)] hover:border-[rgba(234,179,8,0.85)] hover:text-[#F5D76E] font-semibold px-6 w-full sm:w-auto min-h-[48px]"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {copy.btnCompat}
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-4">
              {copy.noSignup}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
