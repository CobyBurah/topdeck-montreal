'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { resolveStainById } from '@/lib/stain-data'

interface FavouritesBarProps {
  favourites: string[]
  onNavigateToColor: (stainId: string) => void
}

export function FavouritesBar({ favourites, onNavigateToColor }: FavouritesBarProps) {
  const t = useTranslations('clientPortal.stainSelector')
  const prefersReducedMotion = useReducedMotion()

  const resolved = favourites
    .map((id) => {
      const result = resolveStainById(id)
      return result ? { id, ...result } : null
    })
    .filter(Boolean) as Array<{
    id: string
    color: { id: string; nameKey: string; thumbnail: string; images: string[] }
    category: string
    brand: string | null
  }>

  if (resolved.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: 0.4 }}
      className="mt-6"
    >
      <h4 className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        {t('yourFavourites')}
      </h4>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {resolved.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: prefersReducedMotion ? 0 : index * 0.05,
              duration: 0.3,
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, transition: { duration: 0.15 } }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={() => onNavigateToColor(item.id)}
            className="flex-shrink-0 w-28 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow group"
          >
            <div className="relative aspect-[4/3] w-full bg-secondary-100">
              <Image
                src={item.color.thumbnail}
                alt={t(`colors.${item.color.nameKey}`)}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="p-2 text-center">
              <span className="text-xs font-medium text-secondary-700 line-clamp-1">
                {t(`colors.${item.color.nameKey}`)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
