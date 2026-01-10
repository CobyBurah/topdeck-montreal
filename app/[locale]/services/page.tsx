'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

export default function ServicesPage() {
  const t = useTranslations('servicesPage')

  const processSteps = [
    {
      step: '01',
      titleKey: 'washing',
      image: 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=1200&q=80',
    },
    {
      step: '02',
      titleKey: 'sanding',
      image: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=1200&q=80',
    },
    {
      step: '03',
      titleKey: 'staining',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    },
  ]

  const surfaces = [
    {
      key: 'decks',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    },
    {
      key: 'fences',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    },
    {
      key: 'railings',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    },
    {
      key: 'pergolas',
      image: 'https://images.unsplash.com/photo-1600607687644-c7531e489bb4?w=800&q=80',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-end overflow-hidden pt-20">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
          alt={t('heroTitle')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative w-full p-8 md:p-16 lg:p-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-white/80 max-w-xl"
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
                <div className="relative h-48">
                  <Image
                    src={surface.image}
                    alt={t(`surfaces.${surface.key}.title`)}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-secondary-900 mb-1">
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
            <Button href="/contact" size="lg">
              {t('ctaButton')}
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
