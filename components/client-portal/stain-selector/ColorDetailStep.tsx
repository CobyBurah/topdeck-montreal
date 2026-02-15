'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { StainColor } from '@/lib/stain-data'

interface ColorDetailStepProps {
  color: StainColor
  isFavourited: boolean
  onToggleFavourite: () => void
}

export function ColorDetailStep({ color, isFavourited, onToggleFavourite }: ColorDetailStepProps) {
  const t = useTranslations('clientPortal.stainSelector')
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const colorName = t(`colors.${color.nameKey}`)

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-secondary-900">
          {t('colorDetail.title', { name: colorName })}
        </h3>
        <p className="text-secondary-500 mt-1 text-sm">
          {t('colorDetail.galleryLabel')}
        </p>

        {/* Favourite button */}
        <div className="mt-4">
          <button
            onClick={onToggleFavourite}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isFavourited
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-white text-secondary-700 border border-secondary-300 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavourited ? 'text-red-500' : 'text-secondary-400'}`}
              fill={isFavourited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={isFavourited ? 0 : 1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {isFavourited ? t('unfavouriteButton') : t('favouriteButton')}
          </button>
          <p className="text-xs text-secondary-400 mt-2 ml-1">
            {t('favouriteDescription')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {color.images.map((image, index) => (
          <motion.div
            key={image}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : index * 0.1,
              duration: 0.4,
            }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary-100 cursor-pointer group"
            onClick={() => setLightboxIndex(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLightboxIndex(index)
              }
            }}
            aria-label={`${colorName} - Image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${colorName} - ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous / Next buttons */}
            {color.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + color.images.length) % color.images.length)
                  }}
                  className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % color.images.length)
                  }}
                  className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl aspect-[4/3] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={color.images[lightboxIndex]}
                alt={`${colorName} - ${lightboxIndex + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
