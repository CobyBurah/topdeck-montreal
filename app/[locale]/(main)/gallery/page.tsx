'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'

export default function GalleryPage() {
  const t = useTranslations('galleryPage')

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-end overflow-hidden pt-20">
        <Image
          src="/GalleryCoverImage.avif"
          alt={t('imageAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative w-full p-8 md:p-16 lg:p-24">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
          >
            {t('title')}
          </motion.h1>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white">
        <GalleryGrid />
      </section>
    </>
  )
}
