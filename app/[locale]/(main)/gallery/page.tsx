import type { Metadata } from 'next'
import GalleryPageClient from './GalleryPageClient'

const meta = {
  en: {
    title: 'Gallery | Wood Restoration Portfolio | Topdeck',
    description: 'See the results for yourself — before & after photos of 25+ Montreal deck, fence, and railing restoration projects. Request a free quote.',
  },
  fr: {
    title: 'Galerie | Portfolio de restauration | Topdeck',
    description: 'Voyez les résultats par vous-même — photos avant et après de 25+ projets de restauration de terrasses, clôtures et rampes à Montréal. Soumission gratuite.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.en
  return {
    ...m,
    alternates: {
      canonical: `/${locale}/gallery`,
      languages: { en: '/en/gallery', fr: '/fr/gallery', 'x-default': '/en/gallery' },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${locale}/gallery`,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
    },
  }
}

export default function GalleryPage() {
  return <GalleryPageClient />
}
