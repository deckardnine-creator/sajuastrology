// SEO Global Step 3: RSS feed for Naver Search Advisor and aggregators
// ---------------------------------------------------------------
// Endpoint: https://sajuastrology.com/rss.xml
//
// This route is designed to be safe even if blog-posts API shape
// varies — it tries multiple known patterns and gracefully degrades.
//
// Why RSS matters:
//   - Naver processes RSS 3-5x faster than sitemap.xml
//   - Required by feed aggregators and reader apps
//   - Provides additional discovery vector for Bingbot/Yandex
// ---------------------------------------------------------------

import { getAllBlogSlugs } from "@/lib/blog-posts";

const BASE = "https://sajuastrology.com";

function escapeXml(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: Date): string {
  return date.toUTCString();
}

// Best-effort metadata lookup. We don't know the exact shape of
// blog-posts module — some setups have getBlogPostBySlug, some have
// allBlogPosts, etc. We probe for the safe fallback: just slug-based.
async function getPostMeta(slug: string): Promise<{
  title: string;
  description: string;
  publishedAt: Date;
}> {
  try {
    const mod: any = await import("@/lib/blog-posts");
    if (typeof mod.getBlogPostBySlug === "function") {
      const post = mod.getBlogPostBySlug(slug);
      if (post) {
        return {
          title: post.title || slug.replace(/-/g, " "),
          description: post.description || post.excerpt || post.summary || "",
          publishedAt: post.publishedAt
            ? new Date(post.publishedAt)
            : post.date
            ? new Date(post.date)
            : new Date(),
        };
      }
    }
  } catch {
    // fall through to default
  }
  return {
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: `SajuAstrology blog post: ${slug.replace(/-/g, " ")}`,
    publishedAt: new Date(),
  };
}

export async function GET() {
  const slugs = getAllBlogSlugs();
  const buildDate = rfc822(new Date());

  const posts = await Promise.all(slugs.map((slug) => getPostMeta(slug).then((meta) => ({ slug, ...meta }))));

  // Sort newest first, limit to 50
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const latest = posts.slice(0, 50);

  const items = latest
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${rfc822(post.publishedAt)}</pubDate>
      <author>info@rimfactory.io (Rimfactory)</author>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>SajuAstrology Blog — Korean Four Pillars Astrology Insights</title>
    <link>${BASE}/blog</link>
    <description>Celebrity Saju readings, classical Four Pillars theory, compatibility patterns, and AI-powered destiny analysis from SajuAstrology.com — the world's first multilingual AI Saju platform.</description>
    <language>en</language>
    <copyright>© 2026 Rimfactory. All rights reserved.</copyright>
    <managingEditor>info@rimfactory.io (Rimfactory)</managingEditor>
    <webMaster>info@rimfactory.io (Rimfactory)</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE}/logo1.png</url>
      <title>SajuAstrology</title>
      <link>${BASE}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

// Force dynamic so we always read latest blog list
export const dynamic = "force-dynamic";
export const revalidate = 0;
