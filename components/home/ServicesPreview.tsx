'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

const processSteps = [
  {
    step: '01',
    key: 'wash',
    image: '/FrontPage-Images/PressureWashing.avif',
    objectPosition: 'center',
  },
  {
    step: '02',
    key: 'sand',
    image: '/FrontPage-Images/Sanding.avif',
    objectPosition: 'center',
  },
  {
    step: '03',
    key: 'stain',
    image: '/FrontPage-Images/Staining.avif',
    objectPosition: 'center',
  },
]

const surfaceKeys = ['decks', 'fences', 'railings', 'patios', 'pergolas', 'stairs'] as const

export function ServicesPreview() {
  const t = useTranslations('servicesPreview')
  const locale = useLocale()

  return (
    <section className="py-20 px-6 lg:px-8 bg-secondary-50">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        {/* Process cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {processSteps.map((item, index) => (
            <motion.div
              key={item.step}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={item.image}
                  alt={t(`steps.${item.key}.title`)}
                  fill
                  className="object-cover"
                  style={{ objectPosition: item.objectPosition }}
                />
                <div className="absolute top-4 left-4 bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {item.step}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                  {t(`steps.${item.key}.title`)}
                </h3>
                <p className="text-secondary-600">
                  {t(`steps.${item.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What we work on */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-secondary-500 mb-4">{t('whatWeWorkOn')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {surfaceKeys.map((key, index) => (
              <motion.span
                key={key}
                className="px-4 py-2 bg-white rounded-full text-secondary-700 font-medium shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              >
                {t(`surfaces.${key}`)}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors"
          >
            {t('learnMore')}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
