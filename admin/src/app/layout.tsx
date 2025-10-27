// src/app/layout.tsx
import type { Metadata } from 'next'
import { appinfo } from '../config'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Geist, Geist_Mono, Bodoni_Moda } from 'next/font/google'
import '@/styles/globals.css'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { AdminLayout } from '@/components'
import Providers from './providers'
import { Noto_Sans_KR } from 'next/font/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${notoSansKR.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AdminAuthProvider>
            <AdminLayout>{children}</AdminLayout>
          </AdminAuthProvider>
        </Providers>
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  )
}

export const metadata: Metadata = {
  alternates: {
    canonical: appinfo.url,
  },
  title: {
    default: appinfo.title + ' - 관리자',
    template: appinfo.titleTemplate,
  },
  description: appinfo.description + ' 관리자 페이지',
  keywords: [...appinfo.keywords, '관리자', 'admin'],
  authors: appinfo.authors,
  creator: appinfo.authors[0].name,
  publisher: appinfo.authors[0].name,
  manifest: '/manifest.json',
  generator: appinfo.authors[0].name,
  applicationName: appinfo.name + ' Admin',
  appleWebApp: {
    capable: true,
    title: appinfo.title + ' 관리자',
  },
  category: 'webapp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: appinfo.name + ' 관리자',
    title: {
      default: appinfo.title + ' - 관리자',
      template: appinfo.titleTemplate,
    },
    description: appinfo.description + ' 관리자 페이지',
    locale: 'ko_KR',
    url: appinfo.url,
    images: {
      url: '/icons/op-image.png',
    },
  },
  referrer: 'origin-when-cross-origin',
  robots: {
    index: false, // 관리자 페이지는 검색엔진에 노출하지 않음
    follow: false,
    googleBot: {
      index: false,
      follow: false,
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
