"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
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

export function BlogArticle({ post }: { post: BlogPost }) {
  // post.locale is the blog article's own language ("ko"/"ja"/"en"),
  // not the user's UI language. Cast to Locale for the t() function.
  const postLocale = post.locale as Locale;

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

          <div className="prose-saju" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

          <div className="mt-12 bg-card/80 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="font-serif text-xl text-primary mb-2">
              {t("blog.readyToSeeChart", postLocale)}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("blog.getFreeReading", postLocale)}
            </p>
            <Link href="/calculate">
              <Button className="gold-gradient text-primary-foreground font-semibold px-8 min-h-[44px]">
                {t("blog.getMyFreeReading", postLocale)} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
