'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { trackGalleryOpen, trackGalleryNav, trackGallerySlider } from '@/lib/analytics'

interface BeforeAfterProject {
  id: number
  titleKey: string
  before: string
  after: string
}

const projects: BeforeAfterProject[] = [
  {
    id: 1,
    titleKey: 'bmNaturalCedartone1',
    before: '/GalleryImages/1-before.avif',
    after: '/GalleryImages/1-after-BM-Semi-NaturalCedartone(ES-45).avif',
  },
  {
    id: 2,
    titleKey: 'bmSeaGullGray',
    before: '/GalleryImages/2-before.avif',
    after: '/GalleryImages/2-after-BM-Solid-SeaGullGray(ES-72).avif',
  },
  {
    id: 3,
    titleKey: 'lignaGoldenPine1',
    before: '/GalleryImages/3-before.avif',
    after: '/GalleryImages/3-after-Ligna-GoldenPine.avif',
  },
  {
    id: 4,
    titleKey: 'steinaLightOak1',
    before: '/GalleryImages/4-before.avif',
    after: '/GalleryImages/4-after-Steina-LightOak.avif',
  },
  {
    id: 5,
    titleKey: 'lignaGoldenPine2',
    before: '/GalleryImages/5-before.avif',
    after: '/GalleryImages/5-after-Ligna-GoldenPine.avif',
  },
  {
    id: 6,
    titleKey: 'lignaMapleSugar',
    before: '/GalleryImages/6-before.avif',
    after: '/GalleryImages/6-after-Ligna-MapleSugar.avif',
  },
  {
    id: 7,
    titleKey: 'bmKendallCharcoal',
    before: '/GalleryImages/7-before.avif',
    after: '/GalleryImages/7-after-BM-Solid-KendallCharcoal(HC-166).avif',
  },
  {
    id: 8,
    titleKey: 'bmNaturalCedartone2',
    before: '/GalleryImages/8-before.avif',
    after: '/GalleryImages/8-after-BM-Semi-NaturalCedartone(ES-45).avif',
  },
  {
    id: 9,
    titleKey: 'steinaLightOak2',
    before: '/GalleryImages/9-before.avif',
    after: '/GalleryImages/9-after-Steina-LightOak.avif',
  },
  {
    id: 10,
    titleKey: 'bmHiddenValley',
    before: '/GalleryImages/10-before.avif',
    after: '/GalleryImages/10-after-BM-HiddenValley(1134).avif',
  },
  {
    id: 11,
    titleKey: 'lignaGoldenPine3',
    before: '/GalleryImages/11-before.avif',
    after: '/GalleryImages/11-after-Ligna-GoldenPine.avif',
  },
  {
    id: 12,
    titleKey: 'steinaNaturalCedar',
    before: '/GalleryImages/12-before.avif',
    after: '/GalleryImages/12-after-Steina-NaturalCedar.avif',
  },
  {
    id: 13,
    titleKey: 'lignaCamel',
    before: '/GalleryImages/13-before.avif',
    after: '/GalleryImages/13-after-Ligna-Camel.avif',
  },
  {
    id: 14,
    titleKey: 'steinaLightOak3',
    before: '/GalleryImages/14-before.avif',
    after: '/GalleryImages/14-after-Steina-LightOak.avif',
  },
  {
    id: 15,
    titleKey: 'bmCordovanBrown',
    before: '/GalleryImages/15-before.avif',
    after: '/GalleryImages/15-after-BM-Solid-CordovanBrown(ES-62).avif',
  },
  {
    id: 16,
    titleKey: 'lignaGoldenPine4',
    before: '/GalleryImages/16-before.avif',
    after: '/GalleryImages/16-after-Ligna-GoldenPine.avif',
  },
  {
    id: 17,
    titleKey: 'lignaPaprika',
    before: '/GalleryImages/17-before.avif',
    after: '/GalleryImages/17-after-Ligna-Paprika.avif',
  },
  {
    id: 18,
    titleKey: 'bmPlatinumGray',
    before: '/GalleryImages/18-before.avif',
    after: '/GalleryImages/18-after-BM-Solid-PlatinumGray(HC-179).avif',
  },
  {
    id: 19,
    titleKey: 'bmNaturalCedartone3',
    before: '/GalleryImages/19-before.avif',
    after: '/GalleryImages/19-after-BM-Semi-NaturalCedartone.avif',
  },
  {
    id: 20,
    titleKey: 'penofinIPEOil',
    before: '/GalleryImages/20-before.avif',
    after: '/GalleryImages/20-after-Penofin-IPEOil.avif',
  },
  {
    id: 21,
    titleKey: 'bmTudorBrown1',
    before: '/GalleryImages/21-before.avif',
    after: '/GalleryImages/21-after-BM-Solid-TudorBrown(HC-185).avif',
  },
  {
    id: 22,
    titleKey: 'steinaLightOak4',
    before: '/GalleryImages/22-before.avif',
    after: '/GalleryImages/22-after-Steina-LightOak.avif',
  },
  {
    id: 23,
    titleKey: 'lignaGoldenPine5',
    before: '/GalleryImages/23-before.avif',
    after: '/GalleryImages/23-after-Ligna-GoldenPine.avif',
  },
  {
    id: 24,
    titleKey: 'bmTudorBrown2',
    before: '/GalleryImages/24-before.avif',
    after: '/GalleryImages/24-after-BM-Solid-TudorBrown(HC-185).avif',
  },
]

function BeforeAfterCard({ project, index, beforeLabel, afterLabel, pauseLabel, playLabel, title, onOpenFullscreen, isFullscreenOpen }: {
  project: BeforeAfterProject
  index: number
  beforeLabel: string
  afterLabel: string
  pauseLabel: string
  playLabel: string
  title: string
  onOpenFullscreen: (position: number, isPaused: boolean) => void
  isFullscreenOpen: boolean
}) {
  const [sliderPosition, setSliderPosition] = useState(0) // 0 = before, 100 = after
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const positionRef = useRef(0)
  const showingBeforeRef = useRef(true)
  const hasDraggedRef = useRef(false)
  const isVisibleRef = useRef(false)

  // Keep positionRef in sync with state
  useEffect(() => {
    positionRef.current = sliderPosition
  }, [sliderPosition])

  // Track visibility with 45% threshold
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.45 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Auto-animate the slider with step-based transitions
  useEffect(() => {
    if (isDragging || isPaused || !isVisible || isFullscreenOpen) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    let timeoutId: NodeJS.Timeout
    let isCancelled = false

    const runAnimation = () => {
      if (isCancelled || !isVisibleRef.current) return

      // Toggle between showing before (0) and after (100)
      const target = showingBeforeRef.current ? 100 : 0
      showingBeforeRef.current = !showingBeforeRef.current

      const duration = 800 // ms for transition
      const startPosition = positionRef.current
      const startTime = performance.now()

      const animate = () => {
        if (isCancelled || !isVisibleRef.current) return

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const newPosition = startPosition + (target - startPosition) * eased
        setSliderPosition(newPosition)
        positionRef.current = newPosition

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          // Wait 4 seconds then animate again
          timeoutId = setTimeout(runAnimation, 4000)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start first animation after initial delay
    timeoutId = setTimeout(runAnimation, 4000)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDragging, isPaused, isVisible, isFullscreenOpen])

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    hasDraggedRef.current = false
    trackGallerySlider(title)
    handleMove(e.clientX)
  }

  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    hasDraggedRef.current = true
    handleMove(e.clientX)
  }, [isDragging, handleMove])

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => { hasDraggedRef.current = false }, 0)
  }, [])

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    hasDraggedRef.current = false
    trackGallerySlider(title)
    handleMove(e.touches[0].clientX)
  }

  const handleCardClick = () => {
    if (!hasDraggedRef.current) {
      onOpenFullscreen(sliderPosition, isPaused)
    }
  }

  // Global mouse/touch move/up handlers for slider dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        hasDraggedRef.current = true
        handleMove(e.touches[0].clientX)
      }
      const handleGlobalTouchEnd = () => {
        setIsDragging(false)
        setTimeout(() => { hasDraggedRef.current = false }, 0)
      }
      window.addEventListener('mousemove', handleSliderMouseMove)
      window.addEventListener('mouseup', handleSliderMouseUp)
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      window.addEventListener('touchend', handleGlobalTouchEnd)
      return () => {
        window.removeEventListener('mousemove', handleSliderMouseMove)
        window.removeEventListener('mouseup', handleSliderMouseUp)
        window.removeEventListener('touchmove', handleGlobalTouchMove)
        window.removeEventListener('touchend', handleGlobalTouchEnd)
      }
    }
  }, [isDragging, handleSliderMouseMove, handleSliderMouseUp, handleMove])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer select-none shadow-lg"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Before image - full, visible on left side */}
        <div className="absolute inset-0">
          <Image
            src={project.before}
            alt={`${title} - ${beforeLabel}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={60}
            draggable={false}
          />
        </div>

        {/* After image - clipped from left, reveals as slider moves right */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <Image
            src={project.after}
            alt={`${title} - ${afterLabel}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            quality={60}
            draggable={false}
          />
        </div>

        {/* Slider line with extended hit area */}
        <div
          className="absolute top-0 bottom-0 w-12 z-10 cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', touchAction: 'none' }}
          onMouseDown={handleSliderMouseDown}
          onTouchStart={handleSliderTouchStart}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visible slider line */}
          <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" />
          {/* Slider handle */}
          <div className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div
          className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-opacity duration-300"
          style={{ opacity: sliderPosition > 20 ? 1 : 0 }}
        >
          {beforeLabel}
        </div>
        <div
          className="absolute top-4 right-4 px-3 py-1.5 bg-primary-500 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-opacity duration-300"
          style={{ opacity: sliderPosition < 80 ? 1 : 0 }}
        >
          {afterLabel}
        </div>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white font-semibold text-lg">{title}</p>
        </div>

        {/* Pause/Play button - visible on hover OR when paused */}
        {(isHovered || isPaused) && (
          <button
            className="absolute bottom-4 right-4 z-20 px-3 py-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              setIsPaused(!isPaused)
            }}
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm font-medium">{playLabel}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span className="text-sm font-medium">{pauseLabel}</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function FullscreenSlider({
  project,
  beforeLabel,
  afterLabel,
  pauseLabel,
  playLabel,
  title,
  initialPosition,
  initialPaused,
  isSliderDraggingRef
}: {
  project: BeforeAfterProject
  beforeLabel: string
  afterLabel: string
  pauseLabel: string
  playLabel: string
  title: string
  initialPosition: number
  initialPaused: boolean
  isSliderDraggingRef: React.MutableRefObject<boolean>
}) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(initialPaused)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const positionRef = useRef(initialPosition)
  const showingBeforeRef = useRef(initialPosition < 50)

  useEffect(() => {
    positionRef.current = sliderPosition
  }, [sliderPosition])

  // Auto-animate the slider
  useEffect(() => {
    if (isDragging || isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    let timeoutId: NodeJS.Timeout
    let isCancelled = false

    const runAnimation = () => {
      if (isCancelled) return

      const target = showingBeforeRef.current ? 100 : 0
      showingBeforeRef.current = !showingBeforeRef.current

      const duration = 800
      const startPosition = positionRef.current
      const startTime = performance.now()

      const animate = () => {
        if (isCancelled) return

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const newPosition = startPosition + (target - startPosition) * eased
        setSliderPosition(newPosition)
        positionRef.current = newPosition

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          timeoutId = setTimeout(runAnimation, 4000)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    timeoutId = setTimeout(runAnimation, 4000)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDragging, isPaused])

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    isSliderDraggingRef.current = true
    handleMove(e.clientX)
  }

  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }, [isDragging, handleMove])

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => { isSliderDraggingRef.current = false }, 0)
  }, [isSliderDraggingRef])

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    handleMove(e.touches[0].clientX)
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        handleMove(e.touches[0].clientX)
      }
      const handleGlobalTouchEnd = () => {
        setIsDragging(false)
      }
      window.addEventListener('mousemove', handleSliderMouseMove)
      window.addEventListener('mouseup', handleSliderMouseUp)
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      window.addEventListener('touchend', handleGlobalTouchEnd)
      return () => {
        window.removeEventListener('mousemove', handleSliderMouseMove)
        window.removeEventListener('mouseup', handleSliderMouseUp)
        window.removeEventListener('touchmove', handleGlobalTouchMove)
        window.removeEventListener('touchend', handleGlobalTouchEnd)
      }
    }
  }, [isDragging, handleSliderMouseMove, handleSliderMouseUp, handleMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Before image - full, visible on left side */}
      <div className="absolute inset-0">
        <Image
          src={project.before}
          alt={`${title} - ${beforeLabel}`}
          fill
          className="object-cover"
          sizes="90vw"
          quality={85}
          priority
        />
      </div>

      {/* After image - clipped from left, reveals as slider moves right */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <Image
          src={project.after}
          alt={`${title} - ${afterLabel}`}
          fill
          className="object-cover"
          sizes="90vw"
          quality={85}
          priority
        />
      </div>

      {/* Slider line with extended hit area */}
      <div
        className="absolute top-0 bottom-0 w-16 z-10 cursor-ew-resize flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', touchAction: 'none' }}
        onMouseDown={handleSliderMouseDown}
        onTouchStart={handleSliderTouchStart}
      >
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" />
        <div className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-secondary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm sm:text-base font-medium transition-opacity duration-300"
        style={{ opacity: sliderPosition > 20 ? 1 : 0 }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-500 backdrop-blur-sm rounded-lg text-white text-sm sm:text-base font-medium transition-opacity duration-300"
        style={{ opacity: sliderPosition < 80 ? 1 : 0 }}
      >
        {afterLabel}
      </div>

      {/* Pause/Play button - visible on hover OR when paused */}
      {(isHovered || isPaused) && (
        <button
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 px-4 py-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation()
            setIsPaused(!isPaused)
          }}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm font-medium">{playLabel}</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              <span className="text-sm font-medium">{pauseLabel}</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export function GalleryGrid() {
  const t = useTranslations('galleryPage')
  const [selectedProject, setSelectedProject] = useState<{ project: BeforeAfterProject; initialPosition: number; initialPaused: boolean } | null>(null)

  // Fullscreen swipe refs
  const swipeStartXRef = useRef(0)
  const swipeStartYRef = useRef(0)
  const isSwipingRef = useRef(false)
  const swipeTouchActiveRef = useRef(false)
  const isSliderDraggingRef = useRef(false)

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

  const currentIndex = selectedProject
    ? projects.findIndex(p => p.id === selectedProject.project.id)
    : -1

  const resetZoom = useCallback(() => {
    setZoomScale(1)
    setZoomTranslate({ x: 0, y: 0 })
    setZoomOrigin({ x: 50, y: 50 })
    panTranslateRef.current = { x: 0, y: 0 }
  }, [])

  const goToPrevious = useCallback(() => {
    resetZoom()
    if (currentIndex > 0) {
      setSelectedProject(prev => prev ? { project: projects[currentIndex - 1], initialPosition: prev.initialPosition, initialPaused: prev.initialPaused } : null)
    } else if (currentIndex === 0) {
      setSelectedProject(prev => prev ? { project: projects[projects.length - 1], initialPosition: prev.initialPosition, initialPaused: prev.initialPaused } : null)
    }
  }, [currentIndex, resetZoom])

  const goToNext = useCallback(() => {
    resetZoom()
    if (currentIndex < projects.length - 1) {
      setSelectedProject(prev => prev ? { project: projects[currentIndex + 1], initialPosition: prev.initialPosition, initialPaused: prev.initialPaused } : null)
    } else if (currentIndex === projects.length - 1) {
      setSelectedProject(prev => prev ? { project: projects[0], initialPosition: prev.initialPosition, initialPaused: prev.initialPaused } : null)
    }
  }, [currentIndex, resetZoom])

  // Pinch-to-zoom handlers for the slider container
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedProject(null)
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }, [goToPrevious, goToNext])

  useEffect(() => {
    if (selectedProject) {
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
        document.documentElement.style.scrollBehavior = 'auto'
        window.scrollTo(0, scrollY)
        requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = ''
        })
      }
    }
  }, [selectedProject, handleKeyDown])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8 lg:p-12">
        {projects.map((project, index) => (
          <BeforeAfterCard
            key={project.id}
            project={project}
            index={index}
            beforeLabel={t('before')}
            afterLabel={t('after')}
            pauseLabel={t('pause')}
            playLabel={t('play')}
            title={t(`projects.${project.titleKey}`)}
            onOpenFullscreen={(position, paused) => { trackGalleryOpen(t(`projects.${project.titleKey}`)); setSelectedProject({ project, initialPosition: position, initialPaused: paused }) }}
            isFullscreenOpen={!!selectedProject}
          />
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-1 sm:px-4 py-4 overscroll-none"
            onClick={() => {
              if (isSliderDraggingRef.current) {
                isSliderDraggingRef.current = false
                return
              }
              if (!isSwipingRef.current) {
                resetZoom()
                setSelectedProject(null)
              }
              isSwipingRef.current = false
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                swipeStartXRef.current = e.touches[0].clientX
                swipeStartYRef.current = e.touches[0].clientY
                isSwipingRef.current = false
                swipeTouchActiveRef.current = true
              }
            }}
            onTouchEnd={(e) => {
              if (!swipeTouchActiveRef.current) return
              swipeTouchActiveRef.current = false
              if (zoomScale > 1 || isPinchingRef.current) return
              const deltaX = e.changedTouches[0].clientX - swipeStartXRef.current
              const deltaY = e.changedTouches[0].clientY - swipeStartYRef.current
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
                setSelectedProject(null)
              }}
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Slider container */}
            <motion.div
              ref={zoomContainerRef}
              key={selectedProject.project.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl"
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={handleImageTouchEnd}
              style={{
                transform: `scale(${zoomScale}) translate(${zoomTranslate.x}px, ${zoomTranslate.y}px)`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
            >
              <FullscreenSlider
                project={selectedProject.project}
                beforeLabel={t('before')}
                afterLabel={t('after')}
                pauseLabel={t('pause')}
                playLabel={t('play')}
                title={t(`projects.${selectedProject.project.titleKey}`)}
                initialPosition={selectedProject.initialPosition}
                initialPaused={selectedProject.initialPaused}
                isSliderDraggingRef={isSliderDraggingRef}
              />
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
                    trackGalleryNav('previous')
                    goToPrevious()
                  }}
                  aria-label="Previous project"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="flex flex-col items-center bg-black/60 backdrop-blur-sm rounded-full px-5 py-2 w-[60vw] sm:w-80">
                  <p className="text-white text-sm sm:text-base font-medium text-center w-full">{t(`projects.${selectedProject.project.titleKey}`)}</p>
                  <p className="text-white/60 text-xs sm:text-sm">{currentIndex + 1} / {projects.length}</p>
                </span>

                <button
                  className="absolute right-2 sm:right-0 p-3 bg-black/60 backdrop-blur-sm hover:bg-black/70 rounded-full text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    trackGalleryNav('next')
                    goToNext()
                  }}
                  aria-label="Next project"
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
    </>
  )
}
