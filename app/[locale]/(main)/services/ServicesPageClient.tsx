'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'

export default function ServicesPage() {
  const t = useTranslations('servicesPage')
  const locale = useLocale()

  const processSteps = [
    {
      step: '01',
      titleKey: 'washing',
      image: '/Services-Images/PressureWashing.avif',
    },
    {
      step: '02',
      titleKey: 'sanding',
      image: '/Services-Images/Sanding.avif',
    },
    {
      step: '03',
      titleKey: 'staining',
      image: '/Services-Images/Staining.avif',
    },
  ]

  const surfaces = [
    {
      key: 'decks',
      image: '/GalleryImages/4-after-Steina-LightOak.avif',
    },
    {
      key: 'fences',
      image: '/GalleryImages/21-after-BM-Solid-TudorBrown(HC-185).avif',
    },
    {
      key: 'railings',
      image: '/GalleryImages/8-after-BM-Semi-NaturalCedartone(ES-45).avif',
    },
    {
      key: 'pergolas',
      image: '/GalleryImages/26-after-BM-Semi-NaturalCedartone.avif',
      objectPosition: 'right center',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[48vh] flex items-end overflow-hidden pt-20">
        <Image
          src="/GalleryImages/23-after-Ligna-GoldenPine.avif"
          alt={t('heroTitle')}
          fill
          className="object-cover"
          style={{ objectPosition: 'center 10%' }}
          priority
          sizes="100vw"
          quality={60}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative w-full p-8 pb-6 md:p-16 md:pb-10 lg:p-24 lg:pb-14">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 4px 24px rgba(0,0,0,0.4)' }}
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-white max-w-xl"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 4px 24px rgba(0,0,0,0.4)' }}
          >
            {t('heroDescription')}
          </motion.p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('processTitle')}
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              {t('processDescription')}
            </p>
          </motion.div>

          <div className="space-y-24">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Image */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden">
                  <Image
                    src={step.image}
                    alt={t(`steps.${step.titleKey}.title`)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    quality={60}
                  />
                  <div className="absolute top-6 left-6 bg-primary-500 text-white text-lg font-bold px-4 py-2 rounded-full">
                    {t('step')} {step.step}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
                    {t(`steps.${step.titleKey}.title`)}
                  </h3>
                  <p className="text-secondary-600 text-lg mb-6">
                    {t(`steps.${step.titleKey}.description`)}
                  </p>
                  <ul className="space-y-3">
                    {(t.raw(`steps.${step.titleKey}.details`) as string[]).map((detail: string) => (
                      <li key={detail} className="flex items-center gap-3 text-secondary-700">
                        <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Work On */}
      <section className="py-20 px-6 lg:px-8 bg-secondary-50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('surfacesTitle')}
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              {t('surfacesDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {surfaces.map((surface, index) => (
              <motion.div
                key={surface.key}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative h-56">
                  <Image
                    src={surface.image}
                    alt={t(`surfaces.${surface.key}.title`)}
                    fill
                    className="object-cover"
                    style={{ objectPosition: surface.objectPosition || 'center' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
                    quality={60}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">
                    {t(`surfaces.${surface.key}.title`)}
                  </h3>
                  <p className="text-secondary-600 text-sm">
                    {t(`surfaces.${surface.key}.description`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 bg-secondary-800">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {t('ctaTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-secondary-300 mb-8"
          >
            {t('ctaDescription')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button href={`/${locale}/contact`} size="lg">
              {t('ctaButton')}
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
