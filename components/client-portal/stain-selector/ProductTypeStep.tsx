'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import {
  PRODUCT_TYPES,
  type StainProductType,
  type StainBrand,
} from '@/lib/stain-data'

interface ProductTypeStepProps {
  availableBrands: StainBrand[]
  onSelect: (productType: StainProductType) => void
}

export function ProductTypeStep({ availableBrands, onSelect }: ProductTypeStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  // Only show product types that have at least one available brand
  const filtered = PRODUCT_TYPES.filter((pt) =>
    pt.brands.some((b) => availableBrands.includes(b))
  )

  return (
    <div className={`grid gap-4 md:gap-6 ${filtered.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
      {filtered.map((pt, index) => (
        <StainCard
          key={pt.id}
          pill={t(`categories.${pt.pillKey}`)}
          title={t(`productTypes.${pt.nameKey}`)}
          description={t(`productTypes.${pt.descriptionKey}`)}
          onClick={() => onSelect(pt.id)}
          index={index}
        />
      ))}
    </div>
  )
}
