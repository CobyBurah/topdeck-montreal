import { Hero } from '@/components/home/Hero'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { Testimonials } from '@/components/home/Testimonials'
import { DeckGallery } from '@/components/home/DeckGallery'
import { CTABanner } from '@/components/home/CTABanner'

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
