'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  STAIN_CATALOG,
  PRODUCT_TYPES,
  BRAND_GROUP_LABELS,
  getAvailableOptionsFromChoices,
  getProductTypeForBrand,
  resolveStainById,
  type StainCategory,
  type StainProductType,
  type StainColor,
} from '@/lib/stain-data'
import { StainBreadcrumb } from './StainBreadcrumb'
import { StainDisclaimer } from './StainDisclaimer'
import { CategoryStep } from './CategoryStep'
import { ProductTypeStep } from './ProductTypeStep'
import { ColorGalleryStep } from './ColorGalleryStep'
import type { ColorGroup } from './ColorGalleryStep'
import { ColorDetailStep } from './ColorDetailStep'

interface StainSectionProps {
  stainChoices?: string[]
  initialFavourites: string[]
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

const fadeTransition = {
  opacity: { duration: 0.15 },
}

export function StainSection({ stainChoices = [], initialFavourites }: StainSectionProps) {
  const t = useTranslations('clientPortal.stainSelector')
  const prefersReducedMotion = useReducedMotion()

  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<StainCategory | null>(null)
  const [selectedProductType, setSelectedProductType] = useState<StainProductType | null>(null)
  const [selectedColor, setSelectedColor] = useState<StainColor | null>(null)
  const [favourites, setFavourites] = useState<string[]>(initialFavourites)

  const variants = prefersReducedMotion ? fadeVariants : slideVariants
  const transition = prefersReducedMotion ? fadeTransition : slideTransition

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }, [currentStep])

  const handleCategorySelect = useCallback((cat: StainCategory) => {
    setSelectedCategory(cat)
    setSelectedProductType(null)
    setSelectedColor(null)
    if (cat === 'solid') {
      setDirection(1)
      setCurrentStep(3)
    } else {
      setDirection(1)
      setCurrentStep(2)
    }
  }, [])

  const handleProductTypeSelect = useCallback((productType: StainProductType) => {
    setSelectedProductType(productType)
    setSelectedColor(null)
    setDirection(1)
    setCurrentStep(3)
  }, [])

  const handleColorSelect = useCallback((color: StainColor) => {
    setSelectedColor(color)
    setDirection(1)
    setCurrentStep(4)
  }, [])

  const handleBack = useCallback(() => {
    if (currentStep === 4) {
      setSelectedColor(null)
      goToStep(3)
    } else if (currentStep === 3 && selectedCategory === 'solid') {
      setSelectedCategory(null)
      goToStep(1)
    } else if (currentStep === 3) {
      setSelectedProductType(null)
      goToStep(2)
    } else if (currentStep === 2) {
      setSelectedCategory(null)
      goToStep(1)
    }
  }, [currentStep, selectedCategory, goToStep])

  const handleNavigateTo = useCallback((step: number) => {
    if (step < currentStep) {
      if (step <= 1) {
        setSelectedCategory(null)
        setSelectedProductType(null)
        setSelectedColor(null)
      } else if (step <= 2) {
        setSelectedProductType(null)
        setSelectedColor(null)
      } else if (step <= 3) {
        setSelectedColor(null)
      }
      goToStep(step)
    }
  }, [currentStep, goToStep])

  const handleToggleFavourite = useCallback(async (stainId: string) => {
    // Optimistic update
    setFavourites((prev) =>
      prev.includes(stainId)
        ? prev.filter((id) => id !== stainId)
        : [...prev, stainId]
    )

    try {
      const response = await fetch('/api/client-portal/favourite-stain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stainId }),
      })
      if (response.ok) {
        const data = await response.json()
        setFavourites(data.favourites)
      } else {
        // Revert on non-OK response
        setFavourites((prev) =>
          prev.includes(stainId)
            ? prev.filter((id) => id !== stainId)
            : [...prev, stainId]
        )
      }
    } catch {
      // Revert on network error
      setFavourites((prev) =>
        prev.includes(stainId)
          ? prev.filter((id) => id !== stainId)
          : [...prev, stainId]
      )
    }
  }, [])

  const handleNavigateToFavourite = useCallback((stainId: string) => {
    const resolved = resolveStainById(stainId)
    if (!resolved) return

    setSelectedCategory(resolved.category)
    if (resolved.brand) {
      const pt = getProductTypeForBrand(resolved.brand)
      setSelectedProductType(pt)
    } else {
      setSelectedProductType(null)
    }
    setSelectedColor(resolved.color)
    setDirection(1)
    setCurrentStep(4)
  }, [])

  // Don't render if no stain choices are set
  if (stainChoices.length === 0) return null

  const { categories: availableCategories, brands: availableBrands, productTypes: availableProductTypes } =
    getAvailableOptionsFromChoices(stainChoices)

  // Get colors for the current selection
  const getColors = (): StainColor[] => {
    if (selectedCategory === 'solid') {
      const solidCat = STAIN_CATALOG.find((c) => c.id === 'solid')
      return solidCat?.colors || []
    }
    if (selectedCategory === 'semi_transparent' && selectedProductType) {
      const ptConfig = PRODUCT_TYPES.find((pt) => pt.id === selectedProductType)
      if (!ptConfig) return []
      const semiCat = STAIN_CATALOG.find((c) => c.id === 'semi_transparent')
      if (!semiCat?.brands) return []

      // For non-grouped product types, return flat colors from the first available brand
      if (!ptConfig.grouped) {
        const brand = semiCat.brands.find(
          (b) => ptConfig.brands.includes(b.id) && availableBrands.includes(b.id)
        )
        return brand?.colors || []
      }

      // For grouped product types, return all colors from all available brands (flat for getColors)
      return ptConfig.brands
        .filter((bid) => availableBrands.includes(bid))
        .flatMap((bid) => semiCat.brands?.find((b) => b.id === bid)?.colors || [])
    }
    return []
  }

  // Get color groups for grouped product types (Penetrating Oil)
  const getColorGroups = (): ColorGroup[] | undefined => {
    if (selectedCategory !== 'semi_transparent' || !selectedProductType) return undefined

    const ptConfig = PRODUCT_TYPES.find((pt) => pt.id === selectedProductType)
    if (!ptConfig?.grouped) return undefined

    const semiCat = STAIN_CATALOG.find((c) => c.id === 'semi_transparent')
    if (!semiCat?.brands) return undefined

    const groups: ColorGroup[] = ptConfig.brands
      .filter((bid) => availableBrands.includes(bid))
      .map((bid) => ({
        labelKey: BRAND_GROUP_LABELS[bid] || bid,
        colors: semiCat.brands?.find((b) => b.id === bid)?.colors || [],
      }))
      .filter((g) => g.colors.length > 0)

    return groups.length > 0 ? groups : undefined
  }

  // Composite key for AnimatePresence to force re-animation
  const stepKey = `step-${currentStep}-${selectedCategory || ''}-${selectedProductType || ''}-${selectedColor?.id || ''}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">{t('title')}</h2>
              <p className="text-secondary-500 text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <StainBreadcrumb
          currentStep={currentStep}
          selectedCategory={selectedCategory}
          selectedProductType={selectedProductType}
          selectedColor={selectedColor}
          onBack={handleBack}
          onNavigateTo={handleNavigateTo}
        />

        {/* Steps with animated transitions */}
        <div className="overflow-hidden -mx-6 -my-4 px-6 py-4 md:-mx-8 md:px-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {currentStep === 1 && (
                <CategoryStep
                  availableCategories={availableCategories}
                  onSelect={handleCategorySelect}
                  favourites={favourites}
                  onNavigateToFavourite={handleNavigateToFavourite}
                />
              )}

              {currentStep === 2 && (
                <ProductTypeStep
                  availableBrands={availableBrands}
                  onSelect={handleProductTypeSelect}
                />
              )}

              {currentStep === 3 && (
                <ColorGalleryStep
                  colors={!getColorGroups() ? getColors() : undefined}
                  colorGroups={getColorGroups()}
                  onSelect={handleColorSelect}
                  note={selectedCategory === 'solid' ? t('solidNote') : undefined}
                />
              )}

              {currentStep === 4 && selectedColor && (
                <ColorDetailStep
                  color={selectedColor}
                  isFavourited={favourites.includes(selectedColor.id)}
                  onToggleFavourite={() => handleToggleFavourite(selectedColor.id)}
                  stainTypePill={
                    selectedCategory === 'solid'
                      ? t('categories.solid')
                      : selectedProductType
                        ? `${t('categories.semiTransparent')} · ${t(`productTypes.${selectedProductType === 'hybrid_oil' ? 'hybridOil' : 'penetratingOil'}`)}`
                        : undefined
                  }
                />
              )}

              <StainDisclaimer />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
