import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

const meta = {
  en: {
    title: 'Contact Us | Free Quote for Deck Painting Montreal | Topdeck',
    description: 'Get a free, no-obligation quote for deck painting, wood staining, and pressure washing in Montreal. Contact the Topdeck team today to restore your outdoor wood.',
  },
  fr: {
    title: 'Contactez-nous | Soumission gratuite pour peinture de terrasse Montréal | Topdeck',
    description: 'Obtenez une soumission gratuite et sans obligation pour la peinture de terrasse, la teinture de bois et le lavage à pression à Montréal. Contactez l\'équipe Topdeck dès aujourd\'hui.',
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
