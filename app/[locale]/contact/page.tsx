'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { QuoteForm } from '@/components/forms/QuoteForm'

export default function ContactPage() {
  const t = useTranslations('contactPage')

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Left - Full image */}
      <div className="relative hidden md:block">
        <Image
          src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80"
          alt={t('imageAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Contact info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
          >
            {t('letsTalk')}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            <a
              href="tel:+15141234567"
              className="block text-xl text-white/90 hover:text-white transition-colors"
            >
              (514) 123-4567
            </a>
            <a
              href="mailto:info@topdeckmontreal.com"
              className="block text-white/80 hover:text-white transition-colors"
            >
              info@topdeckmontreal.com
            </a>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mb-8"
          >
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              {t('getQuote')}
            </h1>
            <p className="text-secondary-600">
              {t('mobileDescription')}
            </p>
          </motion.div>

          {/* Desktop header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block mb-8"
          >
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">
              {t('requestQuote')}
            </h2>
            <p className="text-secondary-600">
              {t('desktopDescription')}
            </p>
          </motion.div>

          <QuoteForm />
        </div>
      </div>
    </main>
  )
}
