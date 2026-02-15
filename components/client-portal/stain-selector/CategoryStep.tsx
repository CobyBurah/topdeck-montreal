'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import { FavouritesBar } from './FavouritesBar'
import type { StainCategory } from '@/lib/stain-data'

interface CategoryStepProps {
  availableCategories: StainCategory[]
  onSelect: (category: StainCategory) => void
  favourites: string[]
  onNavigateToFavourite: (stainId: string) => void
}

export function CategoryStep({
  availableCategories,
  onSelect,
  favourites,
  onNavigateToFavourite,
}: CategoryStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  const categoryConfig: { id: StainCategory; nameKey: string; descKey: string }[] = [
    { id: 'semi_transparent', nameKey: 'semiTransparent', descKey: 'semiTransparentDescription' },
    { id: 'solid', nameKey: 'solid', descKey: 'solidDescription' },
  ]

  const filtered = categoryConfig.filter((c) => availableCategories.includes(c.id))

  return (
    <div>
      <div className={`grid gap-4 md:gap-6 ${filtered.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-md'}`}>
        {filtered.map((cat, index) => (
          <StainCard
            key={cat.id}
            title={t(`categories.${cat.nameKey}`)}
            description={t(`categories.${cat.descKey}`)}
            onClick={() => onSelect(cat.id)}
            index={index}
          />
        ))}
      </div>

      <FavouritesBar
        favourites={favourites}
        onNavigateToColor={onNavigateToFavourite}
      />
    </div>
  )
}
