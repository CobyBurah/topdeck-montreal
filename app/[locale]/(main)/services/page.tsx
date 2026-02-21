import type { Metadata } from 'next'
import ServicesPageClient from './ServicesPageClient'

const meta = {
  en: {
    title: 'Wood Restoration Services | Topdeck Montreal',
    description: 'Professional 3-step wood restoration: wash, sand & stain. We restore decks, fences, railings, pergolas & gazebos across Montreal. Get a free quote.',
  },
  fr: {
    title: 'Services de restauration du bois | Topdeck Montréal',
    description: 'Restauration en 3 étapes : lavage, sablage et teinture. Terrasses, clôtures, rampes, pergolas et gazebos à Montréal. Soumission gratuite.',
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
