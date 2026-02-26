'use client'

import { useTranslations } from 'next-intl'
import { StainCard } from './StainCard'
import type { StainColor } from '@/lib/stain-data'

export interface ColorGroup {
  labelKey: string
  colors: StainColor[]
}

interface ColorGalleryStepProps {
  colors?: StainColor[]
  colorGroups?: ColorGroup[]
  onSelect: (color: StainColor) => void
  note?: string
}

export function ColorGalleryStep({ colors, colorGroups, onSelect, note }: ColorGalleryStepProps) {
  const t = useTranslations('clientPortal.stainSelector')

  // Filter out empty groups
  const nonEmptyGroups = colorGroups?.filter((g) => g.colors.length > 0)
  const showGrouped = nonEmptyGroups && nonEmptyGroups.length > 1

  // Flat rendering (Hybrid Oil, Solid, or single group)
  if (!showGrouped) {
    const flatColors = colors || nonEmptyGroups?.[0]?.colors || []
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {flatColors.map((color, index) => (
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

  // Grouped rendering (Penetrating Oil with both Steina and BM Semi)
  let runningIndex = 0
  return (
    <div>
      {nonEmptyGroups.map((group, groupIndex) => {
        const startIndex = runningIndex
        runningIndex += group.colors.length
        return (
          <div key={group.labelKey}>
            {groupIndex > 0 && (
              <div className="my-6 border-t border-secondary-200" />
            )}
            <p className="text-xs font-medium uppercase tracking-wider text-secondary-400 mb-3">
              {t(`colorGroups.${group.labelKey}`)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {group.colors.map((color, index) => (
                <StainCard
                  key={color.id}
                  title={t(`colors.${color.nameKey}`)}
                  badge={color.badge ? t(`badges.${color.badge}`) : undefined}
                  imageSrc={color.thumbnail}
                  imageAlt={t(`colors.${color.nameKey}`)}
                  onClick={() => onSelect(color)}
                  index={startIndex + index}
                />
              ))}
            </div>
          </div>
        )
      })}
      {note && (
        <p className="mt-4 text-sm text-secondary-500 text-center italic">
          {note}
        </p>
      )}
    </div>
  )
}
