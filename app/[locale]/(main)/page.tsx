import dynamic from 'next/dynamic'
import { Hero } from '@/components/home/Hero'

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
