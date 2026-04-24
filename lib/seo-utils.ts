// ?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•??
// Server-side SEO utilities for locale-aware rendering
// ?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•??
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
// ?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•?â•??

import type { Metadata } from "next";
import { headers } from "next/headers";
import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./translations";

const BASE_URL = "https://sajuastrology.com";

// Locales we actively market (SEO priority). Others get canonical-only treatment.
// Japan > US > Korea per business strategy.
const PRIORITY_LOCALES: readonly Locale[] = ["en", "ja", "ko"] as const;

// ?€?€?€ Server-side locale detection ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
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

// ?€?€?€ Read ?lang= from explicit searchParams (page-level) ?€?€?€?€?€?€?€?€?€?€?€
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

// ?€?€?€ Build hreflang alternates map ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
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

// ?€?€?€ Canonical URL for a given path + locale ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// EN ??/path, others ??/path?lang=xx
export function buildCanonical(path: string, locale: Locale): string {
  if (locale === "en") return `${BASE_URL}${path}`;
  return `${BASE_URL}${path}?lang=${locale}`;
}

// ?€?€?€ Per-locale metadata for the home page ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
// Returns title + description + OG in the requested locale.
// Falls back to English for locales without translated strings.
const HOME_META: Partial<
  Record<Locale, { title: string; description: string; ogTitle?: string }>
> = {
  en: {
    title:
      "SajuAstrology ??Free Korean Astrology Birth Chart Reading | Four Pillars of Destiny",
    description:
      "Free Saju birth chart reading in 30 seconds. 518,400 unique cosmic profiles based on Korean Four Pillars (?¬ì£¼). More precise than Western astrology. Day Master, Five Elements, compatibility, fortune forecast.",
  },
  ja: {
    title:
      "?“å›½å¼ã‚µ?¸ãƒ¥(?›æŸ±?¨å‘½) ???¡æ–™??›¸?§ãƒ»?‹å‹¢?‘å®š | 518,400?šã‚Š??‘½å¼è§£??,
    description:
      "?“å›½5,000å¹´ã®?›æŸ±?¨å‘½??0ç§’ã§?¡æ–™?‘å®š??18,400?šã‚Š??›º?‰å‘½å¼ã€çœŸå¤ªé™½?‚è£œæ­£ã€?62??¤?¸å¼•?¨ã«?ºã¥?AIè§£æ?‚æ—¥ä¸»ãƒ»äº”è¡Œ?ãƒ©?³ã‚¹?»ç›¸?§ãƒ»?‹å‹¢?’å³?‚ç¢ºèªã€‚ç™»?²ä¸è¦ã€?,
    ogTitle: "?“å›½å¼ã‚µ?¸ãƒ¥?¡æ–™?‘å®š ??30ç§’ã§518,400?šã‚Š?‹ã‚‰èª?¿è§£ã",
  },
  ko: {
    title:
      "?¬ì£¼ ë¬´ë£Œ ?€????AI ê¸°ë°˜ ?•í†µ ?¬ì£¼?”ì ë¶„ì„ | ê¶í•©Â·?´ì„¸Â·?€??,
    description:
      "5,000???„í†µ???¬ì£¼?”ìë¥?AIë¡?30ì´?ë¬´ë£Œ ë¶„ì„. 518,400ê°€ì§€ ê³ ìœ  ëª…ì‹, ì§„íƒœ?‘ì‹œ ë³´ì •, 562ê°?ê³ ì „ ?¸ìš© ê¸°ë°˜. ?¼ê°„Â·?¤í–‰Â·ê¶í•©Â·?´ì„¸ ì¦‰ì‹œ ?•ì¸. ?Œì›ê°€??ë¶ˆí•„??",
    ogTitle: "AI ?¬ì£¼ ë¬´ë£Œ ?€????30ì´ˆë©´ ?„ì„±?˜ëŠ” 518,400ê°€ì§€ ëª…ì‹ ë¶„ì„",
  },
  "zh-TW": {
    title: "?“å¼?›æŸ±?½ç† ???è²»?«å­—?ˆç›¤?‡é‹?¢åˆ†??| 518,400?½å¼",
    description:
      "?“åœ‹5,000å¹´å‚³çµ±å››?±æ¨??0ç§’å…è²»åˆ†?ã€?18,400ç¨?¨?¹å‘½å¼ã€çœŸå¤ªé™½?‚æ ¡æ­£ã€?62?¨ç¶“?¸å¼•?¨ã€‚æ—¥ä¸»ã€äº”è¡Œå¹³è¡¡ã€åˆ?¤ã€é‹?¢å³?‚è§£è®€?‚å…è¨»å†Š??,
  },
  es: {
    title:
      "SajuAstrology ??Carta Astral Gratuita de AstrologÃ­a Coreana Saju",
    description:
      "Lectura gratuita de Saju en 30 segundos. 518,400 perfiles cÃ³smicos Ãºnicos basados en los Cuatro Pilares coreanos (?¬ì£¼). MÃ¡s preciso que la astrologÃ­a occidental.",
  },
  fr: {
    title:
      "SajuAstrology ??Lecture Gratuite de Carte du Ciel Saju CorÃ©en",
    description:
      "Lecture Saju gratuite en 30 secondes. 518,400 profils cosmiques uniques basÃ©s sur les Quatre Piliers corÃ©ens (?¬ì£¼). Plus prÃ©cis que l'astrologie occidentale.",
  },
  pt: {
    title:
      "SajuAstrology ??Leitura Gratuita de Mapa Astral Coreano Saju",
    description:
      "Leitura Saju grÃ¡tis em 30 segundos. 518.400 perfis cÃ³smicos Ãºnicos baseados nos Quatro Pilares coreanos (?¬ì£¼). Mais preciso que a astrologia ocidental.",
  },
  ru: {
    title:
      "SajuAstrology ???Ğµ?Ğ¿Ğ»Ğ°?Ğ½Ğ°? ĞºĞ°??Ğ° ?Ğ¾Ğ¶Ğ´ĞµĞ½Ğ¸? Ğ¿Ğ¾ ĞºĞ¾?ĞµĞ¹?ĞºĞ¾Ğ¹ Ğ°???Ğ¾Ğ»Ğ¾Ğ³Ğ¸Ğ¸",
    description:
      "?Ğµ?Ğ¿Ğ»Ğ°?Ğ½?Ğ¹ Ğ°Ğ½Ğ°Ğ»Ğ¸Ğ· Ğ¡Ğ°Ğ´Ğ¶? Ğ·Ğ° 30 ?ĞµĞº?Ğ½Ğ´. 518,400 ?Ğ½Ğ¸ĞºĞ°Ğ»?Ğ½?? ĞºĞ¾?Ğ¼Ğ¸?Ğµ?ĞºĞ¸? Ğ¿?Ğ¾?Ğ¸Ğ»ĞµĞ¹ Ğ½Ğ° Ğ¾?Ğ½Ğ¾Ğ²Ğµ ĞºĞ¾?ĞµĞ¹?ĞºĞ¸? Ğ§Ğµ????? ??Ğ¾Ğ»Ğ¿Ğ¾Ğ² (?¬ì£¼).",
  },
  hi: {
    title: "SajuAstrology ??à¤•à¥‹à¤°à¤¿à¤?¤¾à¤?à¤œà¥à¤?¥‹à¤¤à¤¿à¤?à¤•à¤¾ à¤?¥à¤«à¥à¤?à¤œà¤¨à¥à¤® à¤•à¥à¤‚à¤¡à¤²à? à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
    description:
      "30 à¤¸à¥‡à¤•à¤‚à¤?à¤?¥‡à¤?à¤?¥à¤«à¥à¤?à¤¸à¤¾à¤œà¥‚ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£à¥?518,400 à¤…à¤¦à¥à¤µà¤¿à¤¤à¥€à¤?à¤¬à¥à¤°à¤¹à¥à¤®à¤¾à¤‚à¤¡à?à¤?à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤•à¥‹à¤°à¤¿à¤?¤¾à¤?à¤šà¤¾à¤?à¤¸à¥à¤¤à¤‚à¤?(?¬ì£¼) à¤ªà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤à¥?,
  },
  id: {
    title:
      "SajuAstrology ??Pembacaan Bagan Kelahiran Astrologi Korea Gratis",
    description:
      "Pembacaan Saju gratis dalam 30 detik. 518.400 profil kosmik unik berdasarkan Empat Pilar Korea (?¬ì£¼). Lebih akurat daripada astrologi Barat.",
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

// ?€?€?€ Build full Metadata object for the home page ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
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
          alt: "SajuAstrology ? Ancient Wisdom. Modern Intelligence.",
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

// ?€?€?€ Generic per-page metadata builder ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
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
      ...(overrides?.openGraph || {}),
    },
    ...overrides,
  };
}

// Export priority locales for analytics/decisions
export { PRIORITY_LOCALES };
