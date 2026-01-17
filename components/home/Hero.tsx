'use client'

import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const t = useTranslations('hero')
  const locale = useLocale()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Parallax: background moves slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  // Content fades and moves up as user scrolls
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.8], [0, -50])

  return (
    <section ref={ref} className="relative h-[calc(100vh-80px)] w-full overflow-hidden pt-20">
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
        style={shouldReduceMotion ? {} : { y: springY }}
      >
        <Image
          src="/Homepage-Hero.avif"
          alt={t('imageAlt')}
          fill
          className="object-cover"
          sizes="100vw"
          quality={60}
          priority
        />
      </motion.div>

      {/* Softer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5" />

      {/* Content - positioned at bottom-left with scroll fade */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24"
        style={shouldReduceMotion ? {} : { opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            {t('title1')}
            <br />
            <span className="text-white">{t('title2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-lg md:text-xl text-white/90 max-w-lg"
          >
            {t('description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <Button href={`/${locale}/contact`} size="lg">
              {t('cta')}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
