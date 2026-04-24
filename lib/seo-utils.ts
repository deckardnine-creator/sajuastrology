// ═══════════════════════════════════════════════════════════════════
// Server-side SEO utilities for locale-aware rendering
// ═══════════════════════════════════════════════════════════════════
// Purpose: Read ?lang= query parameter on the SERVER so that Googlebot
// receives HTML with the correct <html lang="..."> and localized
// <meta> tags. Without this, all language variants serve identical
// English HTML and Google collapses them into a single indexed page.
//
// Design:
// - Zero impact on existing client-side LanguageProvider logic
// - Zero impact on Flutter WebView behavior (?lang= param untouched)
// - Reads from request URL via next/headers (App Router, Next.js 16 compatible)
// - Returns safe defaults when headers unavailable (build time, errors)
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { headers } from "next/headers";
import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./translations";

const BASE_URL = "https://sajuastrology.com";

// Locales we actively market (SEO priority). Others get canonical-only treatment.
// Japan > US > Korea per business strategy.
const PRIORITY_LOCALES: readonly Locale[] = ["en", "ja", "ko"] as const;

// ─── Server-side locale detection ──────────────────────────────────
// Reads the ?lang= search parameter from the current request URL.
// Safe for use in Server Components, layouts, and generateMetadata.
// Returns DEFAULT_LOCALE ("en") when unavailable or invalid.
export async function getServerLocale(): Promise<Locale> {
  try {
    const headersList = await headers();
    // Next.js sets x-url or x-invoke-path; Vercel sets x-vercel-sc-headers
    // Most reliable: parse referer or the full URL if available
    const url =
      headersList.get("x-url") ||
      headersList.get("x-invoke-path") ||
      headersList.get("x-matched-path") ||
      "";

    if (url) {
      const queryMatch = url.match(/[?&]lang=([a-zA-Z\-]+)/);
      if (queryMatch) {
        const candidate = queryMatch[1];
        if ((SUPPORTED_LOCALES as readonly string[]).includes(candidate)) {
          return candidate as Locale;
        }
      }
    }

    // Fallback: read Accept-Language header (browser preference)
    const acceptLang = headersList.get("accept-language") || "";
    if (acceptLang) {
      // Parse primary language, e.g. "ja-JP,ja;q=0.9,en;q=0.8"
      const primary = acceptLang.split(",")[0]?.toLowerCase() || "";
      if (primary.startsWith("ja")) return "ja";
      if (primary.startsWith("ko")) return "ko";
      if (primary.startsWith("zh")) return "zh-TW";
      if (primary.startsWith("es")) return "es";
      if (primary.startsWith("fr")) return "fr";
      if (primary.startsWith("pt")) return "pt";
      if (primary.startsWith("ru")) return "ru";
      if (primary.startsWith("hi")) return "hi";
      if (primary.startsWith("id") || primary.startsWith("ms")) return "id";
    }
  } catch {
    // headers() throws in some contexts (build, edge runtime without request)
    // Silently fall through to default
  }

  return DEFAULT_LOCALE;
}

// ─── Read ?lang= from explicit searchParams (page-level) ───────────
// Use this inside page.tsx generateMetadata() where searchParams is passed.
// More reliable than getServerLocale() because it uses the actual URL.
export function localeFromSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined
): Locale {
  if (!searchParams) return DEFAULT_LOCALE;
  const raw = searchParams.lang;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && (SUPPORTED_LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}

// ─── Build hreflang alternates map ─────────────────────────────────
// Returns { "x-default": ..., en: ..., ko: ..., ja: ..., ... }
// EN = canonical (no ?lang=), others = ?lang=xx
export function buildHreflangAlternates(
  path: string
): Record<string, string> {
  const canonical = `${BASE_URL}${path}`;
  const alternates: Record<string, string> = {
    "x-default": canonical,
  };
  for (const loc of SUPPORTED_LOCALES) {
    alternates[loc] =
      loc === "en" ? canonical : `${canonical}?lang=${loc}`;
  }
  return alternates;
}

// ─── Canonical URL for a given path + locale ───────────────────────
// EN → /path, others → /path?lang=xx
export function buildCanonical(path: string, locale: Locale): string {
  if (locale === "en") return `${BASE_URL}${path}`;
  return `${BASE_URL}${path}?lang=${locale}`;
}

// ─── Per-locale metadata for the home page ─────────────────────────
// Returns title + description + OG in the requested locale.
// Falls back to English for locales without translated strings.
const HOME_META: Partial<
  Record<Locale, { title: string; description: string; ogTitle?: string }>
> = {
  en: {
    title:
      "SajuAstrology — Free Korean Astrology Birth Chart Reading | Four Pillars of Destiny",
    description:
      "Free Saju birth chart reading in 30 seconds. 518,400 unique cosmic profiles based on Korean Four Pillars (사주). More precise than Western astrology. Day Master, Five Elements, compatibility, fortune forecast.",
  },
  ja: {
    title:
      "韓国式サジュ(四柱推命) — 無料の相性・運勢鑑定 | 518,400通りの命式解析",
    description:
      "韓国5,000年の四柱推命を30秒で無料鑑定。518,400通りの固有命式、真太陽時補正、562の古典引用に基づくAI解析。日主・五行バランス・相性・運勢を即時確認。登録不要。",
    ogTitle: "韓国式サジュ無料鑑定 — 30秒で518,400通りから読み解く",
  },
  ko: {
    title:
      "사주 무료 풀이 — AI 기반 정통 사주팔자 분석 | 궁합·운세·대운",
    description:
      "5,000년 전통의 사주팔자를 AI로 30초 무료 분석. 518,400가지 고유 명식, 진태양시 보정, 562개 고전 인용 기반. 일간·오행·궁합·운세 즉시 확인. 회원가입 불필요.",
    ogTitle: "AI 사주 무료 풀이 — 30초면 완성되는 518,400가지 명식 분석",
  },
  "zh-TW": {
    title: "韓式四柱命理 — 免費八字合盤與運勢分析 | 518,400命式",
    description:
      "韓國5,000年傳統四柱推命30秒免費分析。518,400種獨特命式、真太陽時校正、562部經典引用。日主、五行平衡、合盤、運勢即時解讀。免註冊。",
  },
  es: {
    title:
      "SajuAstrology — Carta Astral Gratuita de Astrología Coreana Saju",
    description:
      "Lectura gratuita de Saju en 30 segundos. 518,400 perfiles cósmicos únicos basados en los Cuatro Pilares coreanos (사주). Más preciso que la astrología occidental.",
  },
  fr: {
    title:
      "SajuAstrology — Lecture Gratuite de Carte du Ciel Saju Coréen",
    description:
      "Lecture Saju gratuite en 30 secondes. 518,400 profils cosmiques uniques basés sur les Quatre Piliers coréens (사주). Plus précis que l'astrologie occidentale.",
  },
  pt: {
    title:
      "SajuAstrology — Leitura Gratuita de Mapa Astral Coreano Saju",
    description:
      "Leitura Saju grátis em 30 segundos. 518.400 perfis cósmicos únicos baseados nos Quatro Pilares coreanos (사주). Mais preciso que a astrologia ocidental.",
  },
  ru: {
    title:
      "SajuAstrology — Бесплатная карта рождения по корейской астрологии",
    description:
      "Бесплатный анализ Саджу за 30 секунд. 518,400 уникальных космических профилей на основе корейских Четырёх столпов (사주).",
  },
  hi: {
    title: "SajuAstrology — कोरियाई ज्योतिष का मुफ्त जन्म कुंडली विश्लेषण",
    description:
      "30 सेकंड में मुफ्त साजू विश्लेषण। 518,400 अद्वितीय ब्रह्मांडीय प्रोफाइल कोरियाई चार स्तंभ (사주) पर आधारित।",
  },
  id: {
    title:
      "SajuAstrology — Pembacaan Bagan Kelahiran Astrologi Korea Gratis",
    description:
      "Pembacaan Saju gratis dalam 30 detik. 518.400 profil kosmik unik berdasarkan Empat Pilar Korea (사주). Lebih akurat daripada astrologi Barat.",
  },
};

export function getHomeMetadata(locale: Locale): {
  title: string;
  description: string;
  ogTitle: string;
} {
  const meta = HOME_META[locale] || HOME_META.en!;
  return {
    title: meta.title,
    description: meta.description,
    ogTitle: meta.ogTitle || meta.title,
  };
}

// ─── Build full Metadata object for the home page ──────────────────
// Combines locale-aware title/description/OG + hreflang alternates.
export function buildHomeMetadata(locale: Locale): Metadata {
  const { title, description, ogTitle } = getHomeMetadata(locale);
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: buildCanonical("/", locale),
      siteName: "SajuAstrology",
      locale: locale === "en" ? "en_US" : locale === "ja" ? "ja_JP" : locale === "ko" ? "ko_KR" : locale,
      type: "website",
      images: [
        {
          url: "https://sajuastrology.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "SajuAstrology - Ancient Wisdom, Modern Intelligence",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: ["https://sajuastrology.com/og-image.png"],
    },
    alternates: {
      canonical: buildCanonical("/", locale),
      languages: buildHreflangAlternates("/"),
    },
  };
}

// ─── Generic per-page metadata builder ─────────────────────────────
// For pages that have their own title/description translations injected
// later. Right now this just handles hreflang/canonical for any path.
export function buildPageMetadata(
  path: string,
  locale: Locale,
  overrides?: Partial<Metadata>
): Metadata {
  return {
    alternates: {
      canonical: buildCanonical(path, locale),
      languages: buildHreflangAlternates(path),
    },
    openGraph: {
      url: buildCanonical(path, locale),
      locale: locale === "en" ? "en_US" : locale === "ja" ? "ja_JP" : locale === "ko" ? "ko_KR" : locale,
      siteName: "SajuAstrology",
      type: "website",
      images: [
        {
          url: "https://sajuastrology.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "SajuAstrology - Ancient Wisdom, Modern Intelligence",
        },
      ],
      ...(overrides?.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      images: ["https://sajuastrology.com/og-image.png"],
      ...(overrides?.twitter || {}),
    },
    ...overrides,
  };
}

// Export priority locales for analytics/decisions
export { PRIORITY_LOCALES };
