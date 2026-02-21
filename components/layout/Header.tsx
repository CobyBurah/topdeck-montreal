'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')
  const locale = useLocale()

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('gallery'), href: `/${locale}/gallery` },
  ]

  const otherLocale = locale === 'en' ? 'fr' : 'en'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/Topdeck Logo.avif"
              alt="Topdeck Montreal"
              width={250}
              height={94}
              className="h-[90px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-secondary-600 hover:text-primary-500 transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Language Switcher - Toggle Pills */}
            <div className="flex items-center bg-secondary-100 rounded-full p-1">
              <Link
                href="/en"
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  locale === 'en'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                EN
              </Link>
              <Link
                href="/fr"
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  locale === 'fr'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                FR
              </Link>
            </div>

            <Button href={`/${locale}/contact`} size="md">
              {t('getQuote')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <motion.button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-secondary-700 hover:bg-secondary-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={t('toggleMenu')}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
              className="md:hidden overflow-hidden bg-secondary-50 rounded-2xl mt-2"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.12 } }}
                exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
                className="flex flex-col gap-1 p-4"
              >
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.05 * index } }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15, delay: 0 } }}
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-base font-medium text-secondary-700 hover:bg-white hover:text-primary-500 rounded-xl transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Language Switcher - Toggle Pills */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.05 * navigation.length } }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.15, delay: 0 } }}
                  className="px-4 py-2"
                >
                  <div className="flex items-center bg-secondary-100 rounded-full p-1 w-fit">
                    <Link
                      href="/en"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        locale === 'en'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      EN
                    </Link>
                    <Link
                      href="/fr"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        locale === 'fr'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      FR
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.05 * (navigation.length + 1) } }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.15, delay: 0 } }}
                  className="pt-2"
                >
                  <Button href={`/${locale}/contact`} className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('getQuote')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
