import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

const meta = {
  en: {
    title: 'Contact Us | Free Quote | Topdeck Montreal',
    description: 'Get a free, no-obligation quote for exterior wood restoration in Montreal. We restore decks, fences, railings, pergolas & more. Contact us today.',
  },
  fr: {
    title: 'Contactez-nous | Soumission gratuite | Topdeck Montréal',
    description: 'Soumission gratuite pour la restauration de bois extérieur à Montréal. Terrasses, clôtures, rampes et pergolas. Contactez-nous dès aujourd\'hui.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.en
  return {
    ...m,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: '/en/contact', fr: '/fr/contact', 'x-default': '/en/contact' },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${locale}/contact`,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
    },
  }
}

export default function ContactPage() {
  return <ContactPageClient />
}
