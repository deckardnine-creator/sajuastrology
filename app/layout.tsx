import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
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
    default: 'SajuAstrology — Decode Your Cosmic Blueprint',
    template: '%s | SajuAstrology',
  },
  description: 'Your birth date holds a 5,000-year-old code. Discover your destiny through Saju, the ancient Korean Four Pillars system. Get personalized readings from 518,400 unique cosmic profiles.',
  keywords: ['saju', 'korean astrology', 'four pillars', 'destiny', 'horoscope', 'birth chart', '사주', '사주팔자', 'bazi'],
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
    title: 'SajuAstrology — Your Birth Date Holds a 5,000-Year-Old Code',
    description: 'Western astrology gives you 1 of 12 types. Saju gives you 1 of 518,400 unique cosmic profiles. Decode your destiny in 30 seconds.',
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
    title: 'SajuAstrology — Your Birth Date Holds a 5,000-Year-Old Code',
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
}

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${notoSansKR.variable} ${notoSerifKR.variable} font-sans antialiased`}>
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
