'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import type { StainColor } from '@/lib/stain-data'

interface ColorGalleryStepProps {
  colors: StainColor[]
  onSelect: (color: StainColor) => void
}

export function ColorGalleryStep({ colors, onSelect }: ColorGalleryStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {colors.map((color, index) => (
        <StainCard
          key={color.id}
          title={t(`colors.${color.nameKey}`)}
          imageSrc={color.thumbnail}
          imageAlt={t(`colors.${color.nameKey}`)}
          onClick={() => onSelect(color)}
          index={index}
        />
      ))}
    </div>
  )
}
