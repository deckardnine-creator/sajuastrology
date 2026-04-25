import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import MixpanelBootstrap from './MixpanelBootstrap'
import Script from 'next/script'
import { getServerLocale, buildHomeMetadata } from '@/lib/seo-utils'
import { isRTL } from '@/lib/translations'

// Phase 2.5: Force per-request rendering so ?lang= produces distinct HTML.
// Without this, Vercel CDN caches first response and serves it to all locales.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: false,
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: '--font-noto-serif-kr',
  display: 'swap',
  preload: false,
})

const BASE_URL = 'https://sajuastrology.com'
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ''

// ═══════════════════════════════════════════════════════════════════
// SEO Phase 2: Locale-aware metadata generation
// ═══════════════════════════════════════════════════════════════════
// generateMetadata reads ?lang= from request URL and returns
// localized title/description/OG tags. This is what Googlebot sees
// in the server-rendered HTML, fixing the "all language URLs serve
// identical English HTML" problem that caused ?lang=ko to be flagged
// as "Alternate page with proper canonical tag" in Search Console.
//
// Falls back to English when no ?lang= is present (covers main /).
// ═══════════════════════════════════════════════════════════════════
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const baseMetadata = buildHomeMetadata(locale);

  return {
    metadataBase: new URL(BASE_URL),
    ...baseMetadata,
    title: {
      default: baseMetadata.title as string,
      template: '%s | SajuAstrology',
    },
    keywords: [
      // English
      'saju', 'korean astrology', 'four pillars of destiny', 'four pillars', 'birth chart',
      'bazi', 'bazi calculator', 'free birth chart reading', 'astrology reading',
      'day master', 'five elements', 'love compatibility', 'destiny reading',
      'horoscope', 'fortune telling', 'zodiac alternative', 'free astrology',
      'saju reading', 'korean fortune', 'K-astrology', 'birth chart calculator',
      'astrology compatibility', 'personality test astrology', 'cosmic blueprint',
      // Korean
      '사주', '사주팔자', '궁합', '운세', '무료 사주', '사주 보는 법', '오늘 운세',
      '무료 운세', '사주풀이', '2026 운세', '신정비결', '궁합 보기',
      // Japanese
      '四柱推命', '四柱推命 無料', '占い', '相性', '無料 占い', '今日の運勢',
      '韓国', '運勢占い', '四柱占い', '2026 占い',
      // Chinese
      '八字', '八字命理', '八字算命', '四柱命理', '免費八字', '算命八字', '八字合婚', '生辰',
    ],
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
        { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// JSON-LD structured data for the website (locale-independent)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SajuAstrology",
  url: "https://sajuastrology.com",
  description: "Free Korean Four Pillars (Saju) birth chart reading. 518,400 unique cosmic profiles — more precise than Western astrology.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free Saju Reading" },
    { "@type": "Offer", price: "9.99", priceCurrency: "USD", description: "Full Destiny Reading" },
    { "@type": "Offer", price: "29.99", priceCurrency: "USD", description: "Master Consultation (5 sessions)" },
  ],
  creator: { "@type": "Organization", name: "Rimfactory", url: "https://rimfactory.io" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ═══════════════════════════════════════════════════════════════════
  // SEO Phase 2: Server-side locale detection for <html lang>
  // ═══════════════════════════════════════════════════════════════════
  // Reads ?lang= from request URL (or Accept-Language as fallback)
  // and renders <html lang="..."> with the correct attribute server-side.
  // This is the single most important change for multilingual SEO.
  //
  // Client-side LanguageProvider continues to handle locale switching
  // for navigation (it updates document.documentElement.lang in useEffect).
  // For initial server render, the <html lang> matches the URL parameter,
  // so Googlebot sees the correct locale before JavaScript executes.
  // ═══════════════════════════════════════════════════════════════════
  const locale = await getServerLocale();
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark">
      <head>
        <meta name="google-site-verification" content="6n564Wp8VQofMr5VKAQgu-QCBYX7g4I21U9ZiMZuSpI" />
        <meta name="naver-site-verification" content="733a4d2564be68587c86084a7c2f4f3d55251117" />
        <meta name="yandex-verification" content="6131fe3c389007d3" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${notoSansKR.variable} ${notoSerifKR.variable} font-sans antialiased`}>
        {/* GA4 — primary web analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CBGH7EYJWJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CBGH7EYJWJ');
          `}
        </Script>
        {/* Mixpanel — funnels, cohorts, retention (1-year free for startups) */}
        {MIXPANEL_TOKEN && (
          <Script id="mixpanel-init" strategy="afterInteractive">
            {`
              (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
              for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
              window.mixpanel.init('${MIXPANEL_TOKEN}', {
                debug: false,
                track_pageview: true,
                persistence: 'localStorage',
                ignore_dnt: false,
                record_sessions_percent: 100,
                loaded: function(mp) { mp.__loaded = true; if (typeof mp.start_session_recording === 'function') { mp.start_session_recording(); } }
              });
            `}
          </Script>
        )}
        <AuthProvider>
          <LanguageProvider>
            <MixpanelBootstrap />
            {children}
            <SignInModal />
            <ScrollToTop />
            <MobileBottomNav />
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
