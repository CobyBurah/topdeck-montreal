import type { Metadata } from 'next'
import GalleryPageClient from './GalleryPageClient'

const meta = {
  en: {
    title: 'Gallery | Deck & Fence Painting Portfolio | Topdeck',
    description: 'View our gallery of restored outdoor wood in Montreal. See before and after photos of our premium deck painting, fence staining, and pressure washing projects.',
  },
  fr: {
    title: 'Galerie | Portfolio de peinture de terrasses et clôtures | Topdeck',
    description: 'Consultez notre galerie de bois extérieur restauré à Montréal. Voyez les photos avant et après de nos projets de peinture de terrasses, teinture de clôtures et lavage à pression.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.en
  return {
    ...m,
    alternates: {
      canonical: `/${locale}/gallery`,
      languages: { en: '/en/gallery', fr: '/fr/gallery' },
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
