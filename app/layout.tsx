import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import Script from 'next/script'
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'SajuAstrology — Free Korean Astrology Birth Chart Reading | Four Pillars of Destiny',
    template: '%s | SajuAstrology',
  },
  description: 'Free Saju birth chart reading in 30 seconds. 518,400 unique cosmic profiles based on Korean Four Pillars (사주). More precise than Western astrology. Day Master, Five Elements, compatibility, fortune forecast.',
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
    '무료 운세', '사주풀이', '2026 운세', '토정비결', '궁합 보기',
    // Japanese
    '四柱推命', '四柱推命 無料', '相性占い', '運勢', '占い 無料', '今日の運勢',
    '命式', '無料占い', '相性診断', '2026 運勢',
    // Chinese
    '八字', '八字算命', '八字免费', '四柱算命', '生辰八字', '免费算命', '八字合婚', '五行', '命理',
    // Vietnamese
    'tử vi', 'xem tử vi', 'tử vi miễn phí', 'bát tự', 'xem bói', 'tử vi 2026',
    // Thai
    'ดูดวง', 'ดูดวงฟรี', 'โหราศาสตร์', 'ดวงชะตา', 'ดูดวงความรัก',
    // German
    'Horoskop', 'Astrologie', 'Geburtshoroskop', 'chinesisches Horoskop', 'Horoskop kostenlos',
    // French
    'horoscope gratuit', 'astrologie chinoise', 'thème astral', 'compatibilité amoureuse',
    // Russian
    'гороскоп', 'натальная карта', 'гороскоп бесплатно', 'совместимость', 'китайский гороскоп',
    // Spanish
    'horóscopo', 'carta natal', 'horóscopo gratis', 'astrología coreana', 'compatibilidad', 'carta astral gratis',
    // Portuguese
    'horóscopo', 'mapa astral', 'horóscopo grátis', 'astrologia coreana', 'compatibilidade amorosa',
    // Hindi
    'सजू', 'राशिफल', 'जन्म कुंडली', 'मुफ्त राशिफल', 'चार स्तंभ',
    // Indonesian
    'saju', 'ramalan bintang', 'horoskop', 'kompatibilitas cinta', 'ramalan gratis',
  ],
  authors: [{ name: 'SajuAstrology', url: BASE_URL }],
  creator: 'SajuAstrology',
  publisher: 'Rimfactory',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'SajuAstrology',
    title: 'SajuAstrology — Free Korean Four Pillars Birth Chart Reading',
    description: 'Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles. Free reading in 30 seconds.',
    images: [{
      url: `${BASE_URL}/og-image1.png`,
      width: 1200,
      height: 630,
      alt: 'SajuAstrology — Decode Your Cosmic Blueprint',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SajuAstrology — Free Korean Four Pillars Birth Chart Reading',
    description: 'Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles.',
    images: [`${BASE_URL}/og-image1.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "x-default": BASE_URL,
      en: BASE_URL,
      ko: BASE_URL,
      ja: BASE_URL,
      es: BASE_URL,
      fr: BASE_URL,
      pt: BASE_URL,
      "zh-TW": BASE_URL,
      ru: BASE_URL,
      hi: BASE_URL,
      id: BASE_URL,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// JSON-LD structured data for the website
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
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
                record_sessions_percent: 10,
                loaded: function(mp) { mp.__loaded = true; }
              });
            `}
          </Script>
        )}
        <AuthProvider>
          <LanguageProvider>
            {children}
            <SignInModal />
            <ScrollToTop />
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
