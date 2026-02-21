'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'

const featureKeys = ['quality', 'onTime', 'experience'] as const

const icons = {
  quality: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  onTime: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  experience: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
}

export function WhyChooseUs() {
  const t = useTranslations('whyChooseUs')
  const tHero = useTranslations('hero')
  const locale = useLocale()

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-primary-50 rounded-3xl px-8 py-10 md:px-12 md:py-20">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
                {t('subtitle')}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-secondary-900">
                {t('title')}
              </h2>
              <div className="mt-4 w-16 h-1 bg-primary-500 mx-auto rounded-full" />
              <p className="mt-6 text-lg text-secondary-600">
                {t('description')}
              </p>
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {featureKeys.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                    {icons[key]}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="text-center mt-8 md:mt-12 inline-block w-full"
          >
            <Button href={`/${locale}/gallery`} variant="outline">
              {tHero('seeOurWork')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
