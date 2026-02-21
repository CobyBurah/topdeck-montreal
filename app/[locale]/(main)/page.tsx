import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/home/Hero'

const meta = {
  en: {
    title: 'Wood Staining & Restoration Montreal | Topdeck',
    description: 'Montreal\'s deck and fence staining specialists. We wash, sand, and stain your wood back to life — RBQ licensed, 250+ projects completed. Free quotes.',
  },
  fr: {
    title: 'Teinture et restauration de bois | Topdeck Montréal',
    description: 'Spécialistes en teinture de terrasses et clôtures à Montréal. On lave, sable et teint votre bois — licence RBQ, 250+ projets complétés. Soumission gratuite.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.en
  return {
    ...m,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', fr: '/fr', 'x-default': '/en' },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `/${locale}`,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
    },
  }
}

const ServicesPreview = dynamic(
  () => import('@/components/home/ServicesPreview').then(mod => ({ default: mod.ServicesPreview })),
  { loading: () => <div className="h-[600px] bg-secondary-50" /> }
)

const WhyChooseUs = dynamic(
  () => import('@/components/home/WhyChooseUs').then(mod => ({ default: mod.WhyChooseUs })),
  { loading: () => <div className="h-[400px] bg-white" /> }
)

const Testimonials = dynamic(
  () => import('@/components/home/Testimonials').then(mod => ({ default: mod.Testimonials })),
  { loading: () => <div className="h-[200px] bg-primary-400" /> }
)

const DeckGallery = dynamic(
  () => import('@/components/home/DeckGallery').then(mod => ({ default: mod.DeckGallery })),
  { loading: () => <div className="h-[500px] bg-secondary-900" /> }
)

const CTABanner = dynamic(
  () => import('@/components/home/CTABanner').then(mod => ({ default: mod.CTABanner })),
  { loading: () => <div className="h-[300px] bg-secondary-800" /> }
)

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs />
      <Testimonials />
      <DeckGallery />
      <CTABanner />
    </>
  )
}
