import type { Metadata } from 'next'
import ServicesPageClient from './ServicesPageClient'

const meta = {
  en: {
    title: 'Wood Staining & Restoration Services | Topdeck Montreal',
    description: 'Explore our professional 3-step wood restoration process. We specialize in pressure washing, sanding, and staining decks and fences in Montreal.',
  },
  fr: {
    title: 'Services de teinture et restauration de bois | Topdeck Montréal',
    description: 'Découvrez notre processus professionnel de restauration du bois en 3 étapes. Nous sommes spécialisés en lavage à pression, ponçage et teinture de terrasses et clôtures à Montréal.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.en
  return {
    ...m,
    alternates: {
      canonical: `/${locale}/services`,
      languages: { en: '/en/services', fr: '/fr/services', 'x-default': '/en/services' },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${locale}/services`,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
    },
  }
}

export default function ServicesPage() {
  return <ServicesPageClient />
}
