'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'

interface StainCardProps {
  title: string
  description?: string
  badge?: string
  imageSrc?: string
  imageAlt?: string
  onClick: () => void
  index?: number
}

export function StainCard({
  title,
  description,
  badge,
  imageSrc,
  imageAlt,
  onClick,
  index = 0,
}: StainCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations('clientPortal.stainSelector')

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: prefersReducedMotion ? 0 : index * 0.1,
        duration: 0.4,
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      <Card
        variant="elevated"
        padding="none"
        className="cursor-pointer overflow-hidden group h-full flex flex-col"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {imageSrc && (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary-100">
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            />
            {badge && (
              <span className="absolute top-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {badge}
              </span>
            )}
          </div>
        )}
        <div className={imageSrc ? 'p-3 md:p-4' : 'p-5 md:p-6 flex flex-col flex-grow'}>
          <h4 className="text-lg font-semibold text-secondary-900 flex items-center gap-1.5">
            {title}
            {imageSrc && (
              <svg
                className="w-4 h-4 text-secondary-400 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </h4>
          {description && (
            <p className="text-secondary-500 mt-1.5 text-sm leading-relaxed">
              {description}
            </p>
          )}
          {!imageSrc && (
            <div className="mt-auto pt-4 flex items-center text-primary-600 text-sm font-medium">
              <span>{t('exploreColors')}</span>
              <svg
                className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
