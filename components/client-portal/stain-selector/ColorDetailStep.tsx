'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { StainColor } from '@/lib/stain-data'

interface ColorDetailStepProps {
  color: StainColor
  isFavourited: boolean
  onToggleFavourite: () => void
  stainTypePill?: string
}

export function ColorDetailStep({ color, isFavourited, onToggleFavourite, stainTypePill }: ColorDetailStepProps) {
  const t = useTranslations('clientPortal.stainSelector')
  const prefersReducedMotion = useReducedMotion()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Swipe refs
  const swipeStartXRef = useRef(0)
  const swipeStartYRef = useRef(0)
  const isSwipingRef = useRef(false)

  // Pinch-to-zoom state
  const [zoomScale, setZoomScale] = useState(1)
  const [zoomTranslate, setZoomTranslate] = useState({ x: 0, y: 0 })
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const initialPinchDistRef = useRef(0)
  const initialScaleRef = useRef(1)
  const isPinchingRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0 })
  const panTranslateRef = useRef({ x: 0, y: 0 })
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  const colorName = t(`colors.${color.nameKey}`)

  const resetZoom = useCallback(() => {
    setZoomScale(1)
    setZoomTranslate({ x: 0, y: 0 })
    setZoomOrigin({ x: 50, y: 50 })
    panTranslateRef.current = { x: 0, y: 0 }
  }, [])

  const goToPrevious = useCallback(() => {
    resetZoom()
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + color.images.length) % color.images.length)
  }, [lightboxIndex, color.images.length, resetZoom])

  const goToNext = useCallback(() => {
    resetZoom()
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % color.images.length)
  }, [lightboxIndex, color.images.length, resetZoom])

  // Pinch-to-zoom handlers
  const handleImageTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      isPinchingRef.current = true
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      initialPinchDistRef.current = Math.hypot(dx, dy)
      initialScaleRef.current = zoomScale
      if (zoomContainerRef.current) {
        const rect = zoomContainerRef.current.getBoundingClientRect()
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        setZoomOrigin({
          x: ((midX - rect.left) / rect.width) * 100,
          y: ((midY - rect.top) / rect.height) * 100,
        })
      }
    } else if (e.touches.length === 1 && zoomScale > 1) {
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panTranslateRef.current = { ...zoomTranslate }
    }
  }, [zoomScale, zoomTranslate])

  const handleImageTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.min(3, Math.max(1, initialScaleRef.current * (dist / initialPinchDistRef.current)))
      setZoomScale(newScale)
      if (newScale === 1) {
        setZoomTranslate({ x: 0, y: 0 })
        panTranslateRef.current = { x: 0, y: 0 }
      }
    } else if (e.touches.length === 1 && zoomScale > 1 && !isPinchingRef.current) {
      const dx = e.touches[0].clientX - panStartRef.current.x
      const dy = e.touches[0].clientY - panStartRef.current.y
      setZoomTranslate({
        x: panTranslateRef.current.x + dx,
        y: panTranslateRef.current.y + dy,
      })
    }
  }, [zoomScale])

  const handleImageTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false
    }
    if (e.touches.length === 0 && zoomScale > 1) {
      panTranslateRef.current = { ...zoomTranslate }
    }
  }, [zoomScale, zoomTranslate])

  // Keyboard navigation + scroll lock
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      resetZoom()
      setLightboxIndex(null)
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }, [goToPrevious, goToNext, resetZoom])

  useEffect(() => {
    if (lightboxIndex !== null) {
      const scrollY = window.scrollY
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''

        document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
        window.scrollTo(0, scrollY)

        setTimeout(() => {
          document.documentElement.style.removeProperty('scroll-behavior')
        }, 50)
      }
    }
  }, [lightboxIndex, handleKeyDown])

  return (
    <div>
      <div className="mb-6 flex items-start gap-4">
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden shadow-sm border border-secondary-200">
          <Image
            src={color.thumbnail}
            alt={colorName}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div>
        <h3 className="text-2xl font-bold text-secondary-900">
          {t('colorDetail.title', { name: colorName })}
        </h3>
        <p className="text-secondary-500 mt-1 text-sm">
          {t('colorDetail.galleryLabel')}
        </p>

        {/* Favourite button */}
        <div className="mt-4">
          <button
            onClick={onToggleFavourite}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isFavourited
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                : 'bg-white text-secondary-700 border border-secondary-300 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavourited ? 'text-red-500' : 'text-secondary-400'}`}
              fill={isFavourited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={isFavourited ? 0 : 1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {isFavourited ? t('unfavouriteButton') : t('favouriteButton')}
          </button>
          <p className="text-xs text-secondary-400 mt-2 ml-1">
            {t('favouriteDescription')}
          </p>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {color.images.map((image, index) => (
          <motion.div
            key={image}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : index * 0.1,
              duration: 0.4,
            }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary-100 cursor-pointer group"
            onClick={() => setLightboxIndex(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setLightboxIndex(index)
              }
            }}
            aria-label={`${colorName} - Image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${colorName} - ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox - matching homepage DeckGallery design */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-1 sm:px-4 py-4 overscroll-none"
            onClick={() => {
              if (!isSwipingRef.current) {
                resetZoom()
                setLightboxIndex(null)
              }
              isSwipingRef.current = false
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                swipeStartXRef.current = e.touches[0].clientX
                swipeStartYRef.current = e.touches[0].clientY
                isSwipingRef.current = false
              }
            }}
            onTouchEnd={(e) => {
              if (zoomScale > 1 || isPinchingRef.current) return
              const deltaX = e.changedTouches[0].clientX - swipeStartXRef.current
              const deltaY = e.changedTouches[0].clientY - swipeStartYRef.current
              if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                isSwipingRef.current = true
                if (deltaX > 0) goToPrevious()
                else goToNext()
              }
            }}
            onMouseDown={(e) => {
              swipeStartXRef.current = e.clientX
              swipeStartYRef.current = e.clientY
              isSwipingRef.current = false
            }}
            onMouseUp={(e) => {
              const deltaX = e.clientX - swipeStartXRef.current
              const deltaY = e.clientY - swipeStartYRef.current
              if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                isSwipingRef.current = true
                if (deltaX > 0) goToPrevious()
                else goToNext()
              }
            }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                resetZoom()
                setLightboxIndex(null)
              }}
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <motion.div
              ref={zoomContainerRef}
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={handleImageTouchEnd}
              style={{
                transform: `scale(${zoomScale}) translate(${zoomTranslate.x}px, ${zoomTranslate.y}px)`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={color.images[lightboxIndex]}
                  alt={`${colorName} - ${lightboxIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  quality={100}
                  priority
                />
              </div>
            </motion.div>

            {/* Bottom navigation bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute bottom-4 sm:bottom-6 left-0 right-0"
            >
              <div className="relative flex items-center justify-center px-16 sm:max-w-md sm:mx-auto">
                <button
                  className="absolute left-2 sm:left-0 p-3 bg-black/60 backdrop-blur-sm hover:bg-black/70 rounded-full text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="flex flex-col items-center bg-black/60 rounded-2xl px-5 py-2.5 w-[70vw] sm:w-80">
                  <p className="text-white text-base sm:text-lg font-medium text-center w-full">{colorName}</p>
                  {stainTypePill && (
                    <p className="text-white/60 text-xs sm:text-sm mt-0.5">{stainTypePill}</p>
                  )}
                  <p className="text-white/40 text-xs sm:text-sm mt-0.5">{lightboxIndex + 1} / {color.images.length}</p>
                </span>

                <button
                  className="absolute right-2 sm:right-0 p-3 bg-black/60 backdrop-blur-sm hover:bg-black/70 rounded-full text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
