import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.topdeckmontreal.com'),
  title: 'Topdeck Montreal | Exterior Wood Staining & Restoration',
  description: 'Montreal\'s deck and fence staining specialists. We wash, sand, and stain your wood back to life — RBQ licensed, 250+ projects completed. Free quotes.',
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
        alt: 'Topdeck Montreal - Specialized Exterior Wood Restoration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/Topdeck-Icon.ico',
    apple: '/Topdeck-Icon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
