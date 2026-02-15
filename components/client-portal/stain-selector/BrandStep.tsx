'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import type { StainBrand, StainBrandConfig } from '@/lib/stain-data'

interface BrandStepProps {
  availableBrands: StainBrand[]
  brands: StainBrandConfig[]
  onSelect: (brand: StainBrand) => void
}

export function BrandStep({ availableBrands, brands, onSelect }: BrandStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  const filtered = brands.filter((b) => availableBrands.includes(b.id))

  return (
    <div className={`grid gap-4 md:gap-6 ${filtered.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
      {filtered.map((brand, index) => (
        <StainCard
          key={brand.id}
          title={t(`brands.${brand.nameKey}`)}
          description={t(`brands.${brand.descriptionKey}`)}
          onClick={() => onSelect(brand.id)}
          index={index}
        />
      ))}
    </div>
  )
}
