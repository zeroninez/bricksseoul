import type { Metadata, Viewport } from 'next'
import { appinfo } from '../../config'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import '@/styles/globals.css'
import { Layout } from '@/components'
import { Locale, routing } from '@/i18n/routing'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Providers from './providers'
import { Noto_Sans_KR } from 'next/font/google'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: Locale }> // Next.js 15에서는 Promise로 params를 받아야 합니다.
}>) {
  const locale = (await params).locale

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`antialiased ${notoSansKR.variable}`}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Layout>{children}</Layout>
          </NextIntlClientProvider>
        </Providers>
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  )
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#ffffff',
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  alternates: {
    canonical: appinfo.url,
  },
  title: {
    default: appinfo.title,
    template: appinfo.titleTemplate,
  },
  description: appinfo.description,
  keywords: appinfo.keywords,
  authors: appinfo.authors,
  creator: appinfo.authors[0].name,
  publisher: appinfo.authors[0].name,
  manifest: '/manifest.json',
  generator: appinfo.authors[0].name,
  applicationName: appinfo.name,
  appleWebApp: {
    capable: true,
    title: appinfo.title,
    // startUpImage: [],
  },
  category: 'webapp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: appinfo.name,
    title: {
      default: appinfo.title,
      template: appinfo.titleTemplate,
    },
    description: appinfo.description,
    locale: 'ko_KR',
    url: appinfo.url,
    images: {
      url: '/icons/op-image.png',
    },
  },
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: {
      rel: 'mask-icon',
      url: '/icons/safari-pinned-tab.svg',
      color: '#000000',
    },
  },
}
