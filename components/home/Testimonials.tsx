'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { AnimatedCounter } from '@/components/animations'

export function Testimonials() {
  const t = useTranslations('testimonials')

  const stats = [
    { value: 500, suffix: '+', labelKey: 'projectsCompleted' },
    { value: 10, suffix: '+', labelKey: 'yearsExperience' },
    { value: 5.0, suffix: '', labelKey: 'starRating', decimals: 1 },
  ]

  return (
    <section className="py-16 md:py-20 bg-primary-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-around items-center gap-10 md:gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-5xl md:text-6xl font-bold text-white">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                />
              </div>
              <p className="mt-2 text-white/90 font-medium">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
