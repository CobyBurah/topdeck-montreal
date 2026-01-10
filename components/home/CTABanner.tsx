'use client'

import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'

export function CTABanner() {
  const ref = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const t = useTranslations('ctaBanner')
  const locale = useLocale()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Parallax: background moves at different speed
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <section ref={ref} className="relative h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
        style={shouldReduceMotion ? {} : { y: springY }}
      >
        <Image
          src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80"
          alt={t('imageAlt')}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Softer overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
        >
          {t('title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-lg text-white/90 mb-8 max-w-lg mx-auto"
        >
          {t('description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            href={`/${locale}/contact`}
            size="lg"
            className="bg-white text-secondary-900 hover:bg-primary-500 hover:text-white"
          >
            {t('cta')}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
