'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import type { StainColor } from '@/lib/stain-data'

interface ColorGalleryStepProps {
  colors: StainColor[]
  onSelect: (color: StainColor) => void
  note?: string
}

export function ColorGalleryStep({ colors, onSelect, note }: ColorGalleryStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {colors.map((color, index) => (
          <StainCard
            key={color.id}
            title={t(`colors.${color.nameKey}`)}
            badge={color.badge ? t(`badges.${color.badge}`) : undefined}
            imageSrc={color.thumbnail}
            imageAlt={t(`colors.${color.nameKey}`)}
            onClick={() => onSelect(color)}
            index={index}
          />
        ))}
      </div>
      {note && (
        <p className="mt-4 text-sm text-secondary-500 text-center italic">
          {note}
        </p>
      )}
    </div>
  )
}
