'use client'

import { useTranslations } from 'next-intl'
import type { StainCategory, StainBrand, StainColor } from '@/lib/stain-data'

interface StainBreadcrumbProps {
  currentStep: number
  selectedCategory: StainCategory | null
  selectedBrand: StainBrand | null
  selectedColor: StainColor | null
  onBack: () => void
  onNavigateTo: (step: number) => void
}

export function StainBreadcrumb({
  currentStep,
  selectedCategory,
  selectedBrand,
  selectedColor,
  onBack,
  onNavigateTo,
}: StainBreadcrumbProps) {
  const t = useTranslations('clientPortal.stainSelector')

  if (currentStep <= 1) return null

  const segments: { label: string; step: number }[] = [
    { label: t('breadcrumb.categories'), step: 1 },
  ]

  if (selectedCategory && currentStep >= 2) {
    segments.push({
      label: t(`categories.${selectedCategory === 'semi_transparent' ? 'semiTransparent' : 'solid'}`),
      step: selectedCategory === 'solid' ? 3 : 2,
    })
  }

  if (selectedBrand && currentStep >= 3 && selectedCategory === 'semi_transparent') {
    segments.push({
      label: t(`brands.${selectedBrand}`),
      step: 3,
    })
  }

  if (selectedColor && currentStep === 4) {
    segments.push({
      label: t(`colors.${selectedColor.nameKey}`),
      step: 4,
    })
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary-100 transition-colors text-secondary-600"
        aria-label={t('back')}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <nav className="flex items-center gap-1.5 text-sm overflow-x-auto" aria-label="Breadcrumb">
        {segments.map((segment, i) => {
          const isLast = i === segments.length - 1
          return (
            <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-secondary-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
              {isLast ? (
                <span className="text-secondary-900 font-medium">{segment.label}</span>
              ) : (
                <button
                  onClick={() => onNavigateTo(segment.step)}
                  className="text-secondary-500 hover:text-primary-600 transition-colors"
                >
                  {segment.label}
                </button>
              )}
            </span>
          )
        })}
      </nav>
    </div>
  )
}
