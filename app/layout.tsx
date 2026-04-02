import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { BottomNav } from '@/components/app/bottom-nav'
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${notoSansKR.variable} ${notoSerifKR.variable} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <div className="pb-14 md:pb-0">
              {children}
            </div>
            <SignInModal />
            <ScrollToTop />
            <BottomNav />
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
