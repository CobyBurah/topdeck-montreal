import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.topdeckmontreal.com'),
  title: 'Deck Painting Montreal | Topdeck | Get A Free Quote',
  description: 'Expert deck staining, fence staining, and pressure washing in Montreal. Protect and enhance your outdoor spaces with Topdeck Montreal.',
  alternates: {
    canonical: '/en',
    languages: {
      en: '/en',
      fr: '/fr',
      'x-default': '/en',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Topdeck Montreal',
    locale: 'en_CA',
    images: [
      {
        url: '/Homepage-Hero.avif',
        width: 1200,
        height: 630,
        alt: 'Topdeck Montreal - Professional Deck Staining & Restoration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/Topdeck-Square.jpg',
    apple: '/Topdeck-Square.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
