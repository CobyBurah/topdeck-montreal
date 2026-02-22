'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { trackGalleryOpen, trackGalleryNav } from '@/lib/analytics'

interface GalleryImage {
  id: number
  src: string
  alt: string
  title: string
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: '/GalleryImages/1-after-BM-Semi-NaturalCedartone(ES-45).avif',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 2,
    src: '/GalleryImages/2-after-BM-Solid-SeaGullGray(ES-72).avif',
    alt: 'Deck stained with Benjamin Moore Sea Gull Gray',
    title: 'Benjamin Moore Sea Gull Gray',
  },
  {
    id: 3,
    src: '/GalleryImages/3-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 4,
    src: '/GalleryImages/4-after-Steina-LightOak.avif',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 6,
    src: '/GalleryImages/6-after-Ligna-MapleSugar.avif',
    alt: 'Deck stained with Ligna Maple Sugar',
    title: 'Ligna Maple Sugar',
  },
  {
    id: 7,
    src: '/GalleryImages/7-after-BM-Solid-KendallCharcoal(HC-166).avif',
    alt: 'Deck stained with Benjamin Moore Kendall Charcoal',
    title: 'Benjamin Moore Kendall Charcoal',
  },
  {
    id: 8,
    src: '/GalleryImages/25-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 9,
    src: '/GalleryImages/8-after-BM-Semi-NaturalCedartone(ES-45).avif',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 10,
    src: '/GalleryImages/9-after-Steina-LightOak.avif',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 11,
    src: '/GalleryImages/10-after-BM-HiddenValley(1134).avif',
    alt: 'Deck stained with Benjamin Moore Hidden Valley',
    title: 'Benjamin Moore Hidden Valley',
  },
  {
    id: 12,
    src: '/GalleryImages/11-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 13,
    src: '/GalleryImages/12-after-Steina-NaturalCedar.avif',
    alt: 'Deck stained with Steina Natural Cedar',
    title: 'Steina Natural Cedar',
  },
  {
    id: 14,
    src: '/GalleryImages/13-after-Ligna-Camel.avif',
    alt: 'Deck stained with Ligna Camel',
    title: 'Ligna Camel',
  },
  {
    id: 15,
    src: '/GalleryImages/14-after-Steina-LightOak.avif',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 16,
    src: '/GalleryImages/15-after-BM-Solid-CordovanBrown(ES-62).avif',
    alt: 'Deck stained with Benjamin Moore Cordovan Brown',
    title: 'Benjamin Moore Cordovan Brown',
  },
  {
    id: 17,
    src: '/GalleryImages/16-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 18,
    src: '/GalleryImages/26-after-BM-Semi-NaturalCedartone.avif',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 19,
    src: '/GalleryImages/17-after-Ligna-Paprika.avif',
    alt: 'Deck stained with Ligna Paprika',
    title: 'Ligna Paprika',
  },
  {
    id: 20,
    src: '/GalleryImages/18-after-BM-Solid-PlatinumGray(HC-179).avif',
    alt: 'Deck stained with Benjamin Moore Platinum Gray',
    title: 'Benjamin Moore Platinum Gray',
  },
  {
    id: 21,
    src: '/GalleryImages/19-after-BM-Semi-NaturalCedartone.avif',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 22,
    src: '/GalleryImages/20-after-Penofin-IPEOil.avif',
    alt: 'Deck stained with Penofin IPE Oil',
    title: 'Penofin IPE Oil',
  },
  {
    id: 23,
    src: '/GalleryImages/21-after-BM-Solid-TudorBrown(HC-185).avif',
    alt: 'Deck stained with Benjamin Moore Tudor Brown',
    title: 'Benjamin Moore Tudor Brown',
  },
  {
    id: 24,
    src: '/GalleryImages/22-after-Steina-LightOak.avif',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 25,
    src: '/GalleryImages/23-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 26,
    src: '/GalleryImages/24-after-BM-Solid-TudorBrown(HC-185).avif',
    alt: 'Deck stained with Benjamin Moore Tudor Brown',
    title: 'Benjamin Moore Tudor Brown',
  },
]

// Split images into two rows
const topRowImages = galleryImages.filter((_, i) => i % 2 === 0)
const bottomRowImages = galleryImages.filter((_, i) => i % 2 === 1)

// Triple each row for seamless infinite scroll: [SET A][SET B][SET C]
const tripledTopRow = [...topRowImages, ...topRowImages, ...topRowImages]
const tripledBottomRow = [...bottomRowImages, ...bottomRowImages, ...bottomRowImages]

function ImageCard({ image, onMouseDown, onTouchStart }: { image: GalleryImage; onMouseDown: () => void; onTouchStart: () => void }) {
  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[320px] cursor-pointer"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden group">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 280px, 320px"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white font-medium text-sm">{image.title}</p>
        </div>
      </div>
    </div>
  )
}

export function DeckGallery() {
  const t = useTranslations('deckGallery')
  const locale = useLocale()
  const isPausedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const topRowRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const scrollPosRef = useRef(0)
  const oneSetWidthRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickedImageRef = useRef<GalleryImage | null>(null)
  const isVisibleRef = useRef(true)

  // Fullscreen swipe refs
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

  // Track visibility with IntersectionObserver
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0.1 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Get current image index
  const currentIndex = selectedImage
    ? galleryImages.findIndex(img => img.id === selectedImage.id)
    : -1

  // Reset zoom when changing images
  const resetZoom = useCallback(() => {
    setZoomScale(1)
    setZoomTranslate({ x: 0, y: 0 })
    setZoomOrigin({ x: 50, y: 50 })
    panTranslateRef.current = { x: 0, y: 0 }
  }, [])

  // Navigate to previous/next image
  const goToPrevious = useCallback(() => {
    resetZoom()
    if (currentIndex > 0) {
      setSelectedImage(galleryImages[currentIndex - 1])
    } else if (currentIndex === 0) {
      setSelectedImage(galleryImages[galleryImages.length - 1])
    }
  }, [currentIndex, resetZoom])

  const goToNext = useCallback(() => {
    resetZoom()
    if (currentIndex < galleryImages.length - 1) {
      setSelectedImage(galleryImages[currentIndex + 1])
    } else if (currentIndex === galleryImages.length - 1) {
      setSelectedImage(galleryImages[0])
    }
  }, [currentIndex, resetZoom])

  // Pinch-to-zoom handlers for the image container
  const handleImageTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      isPinchingRef.current = true
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      initialPinchDistRef.current = Math.hypot(dx, dy)
      initialScaleRef.current = zoomScale
      // Set transform origin to pinch midpoint
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
      // Pan when zoomed
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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedImage(null)
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }, [goToPrevious, goToNext])

  useEffect(() => {
    if (selectedImage) {
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
  }, [selectedImage, handleKeyDown])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setHasDragged(false)
    startXRef.current = e.pageX
    startYRef.current = e.pageY
    scrollLeftRef.current = containerRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()

    const deltaX = Math.abs(e.pageX - startXRef.current)
    const deltaY = Math.abs(e.pageY - startYRef.current)
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true)
      if (deltaX > 5) {
        isPausedRef.current = true
        scheduleResume()
      }
    }

    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const startX = startXRef.current - (containerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeftRef.current - walk

    // Normalize during drag to prevent reaching edges
    const oneSetWidth = oneSetWidthRef.current
    if (oneSetWidth > 0) {
      const pos = containerRef.current.scrollLeft
      if (pos >= oneSetWidth * 2) {
        containerRef.current.scrollLeft = pos - oneSetWidth
        scrollLeftRef.current -= oneSetWidth
      } else if (pos < oneSetWidth) {
        containerRef.current.scrollLeft = pos + oneSetWidth
        scrollLeftRef.current += oneSetWidth
      }
      scrollPosRef.current = containerRef.current.scrollLeft
    }
  }

  const handleMouseUp = () => {
    if (!hasDragged && clickedImageRef.current) {
      trackGalleryOpen(clickedImageRef.current.title)
      setSelectedImage(clickedImageRef.current)
    }
    setIsDragging(false)
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft
    }
    isPausedRef.current = false
    clickedImageRef.current = null
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft
    }
    isPausedRef.current = false
    clickedImageRef.current = null
  }

  const handleImageMouseDown = (image: GalleryImage) => {
    clickedImageRef.current = image
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    isPausedRef.current = true
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    setHasDragged(false)
    startXRef.current = e.touches[0].pageX
    startYRef.current = e.touches[0].pageY
    scrollLeftRef.current = containerRef.current?.scrollLeft || 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].pageX - startXRef.current)
    const deltaY = Math.abs(e.touches[0].pageY - startYRef.current)
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true)
      if (deltaX > 5) {
        isPausedRef.current = true
        scheduleResume()
      }
    }
  }

  const handleTouchEnd = () => {
    if (!hasDragged && clickedImageRef.current) {
      trackGalleryOpen(clickedImageRef.current.title)
      setSelectedImage(clickedImageRef.current)
    }
    // Don't unpause here — let scheduleResume() handle it after momentum scrolling finishes.
    // If user just tapped (no drag), animation was never paused so no action needed.
    clickedImageRef.current = null
  }

  const handleWheel = (e: React.WheelEvent) => {
    // Only pause on horizontal scroll (intentional gallery interaction),
    // not vertical page scrolling
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      isPausedRef.current = true
      scheduleResume()
    }
  }

  // Normalize on every native scroll event (covers touch + wheel scrolling)
  const handleScroll = () => {
    // Only normalize during user interaction; the animation loop handles its own wrapping
    if (!isPausedRef.current) return

    const oneSetWidth = oneSetWidthRef.current
    if (!containerRef.current || oneSetWidth === 0) return

    const pos = containerRef.current.scrollLeft
    if (pos >= oneSetWidth * 2) {
      containerRef.current.scrollLeft = pos - oneSetWidth
      scrollLeftRef.current -= oneSetWidth
      scrollPosRef.current = containerRef.current.scrollLeft
    } else if (pos < oneSetWidth) {
      containerRef.current.scrollLeft = pos + oneSetWidth
      scrollLeftRef.current += oneSetWidth
      scrollPosRef.current = containerRef.current.scrollLeft
    }
  }

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false
    }, 2000)
  }, [])

  // Measure the width of one set of images (SET A) from the top row
  const measureOneSetWidth = useCallback(() => {
    if (!topRowRef.current) return
    const children = topRowRef.current.children
    const setSize = topRowImages.length
    if (children.length > setSize) {
      const firstOfSetB = children[setSize] as HTMLElement
      oneSetWidthRef.current = firstOfSetB.offsetLeft
    }
  }, [])

  // On mount and resize: measure one-set width and position at SET B
  useEffect(() => {
    measureOneSetWidth()
    if (containerRef.current && oneSetWidthRef.current > 0) {
      containerRef.current.scrollLeft = oneSetWidthRef.current
      scrollPosRef.current = oneSetWidthRef.current
    }

    const handleResize = () => {
      measureOneSetWidth()
      if (containerRef.current && oneSetWidthRef.current > 0) {
        containerRef.current.scrollLeft = oneSetWidthRef.current
        scrollPosRef.current = oneSetWidthRef.current
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [measureOneSetWidth])

  // Auto-scroll effect with seamless wrap — runs for entire component lifetime
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let lastTime = performance.now()

    const scroll = (time: DOMHighResTimeStamp) => {
      const deltaTime = time - lastTime
      lastTime = time

      if (isPausedRef.current) {
        animationId = requestAnimationFrame(scroll)
        return
      }

      const oneSetWidth = oneSetWidthRef.current
      if (oneSetWidth > 0) {
        const speedPerMs = 30 / 1000
        scrollPosRef.current += speedPerMs * deltaTime
        if (scrollPosRef.current >= oneSetWidth * 2) {
          scrollPosRef.current -= oneSetWidth
        }
        container.scrollLeft = scrollPosRef.current
      }

      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)
    return () => {
      cancelAnimationFrame(animationId)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])


  return (
    <section ref={sectionRef} className="pt-10 pb-6 bg-secondary-50 overflow-hidden">
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onScroll={handleScroll}
      >
        {/* Top row */}
        <div ref={topRowRef} className="flex gap-4 mb-4">
          {tripledTopRow.map((image, idx) => (
            <ImageCard key={`top-${idx}`} image={image} onMouseDown={() => handleImageMouseDown(image)} onTouchStart={() => handleImageMouseDown(image)} />
          ))}
        </div>
        {/* Bottom row - offset for visual interest */}
        <div className="flex gap-4 pl-[140px] md:pl-[160px]">
          {tripledBottomRow.map((image, idx) => (
            <ImageCard key={`bottom-${idx}`} image={image} onMouseDown={() => handleImageMouseDown(image)} onTouchStart={() => handleImageMouseDown(image)} />
          ))}
        </div>
      </div>

      {/* View All Work CTA */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href={`/${locale}/gallery`}
          className="group inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors"
        >
          {t('viewAllWork')}
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </motion.div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-1 sm:px-4 py-4 overscroll-none"
            onClick={() => {
              if (!isSwipingRef.current) {
                resetZoom()
                setSelectedImage(null)
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
                setSelectedImage(null)
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
              key={selectedImage.id}
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
                  src={selectedImage.src}
                  alt={selectedImage.alt}
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
                    trackGalleryNav('previous')
                    goToPrevious()
                  }}
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="flex flex-col items-center bg-black/60 backdrop-blur-sm rounded-full px-5 py-2 w-[60vw] sm:w-80">
                  <p className="text-white text-sm sm:text-base font-medium text-center w-full">{selectedImage.title}</p>
                  <p className="text-white/60 text-xs sm:text-sm">{currentIndex + 1} / {galleryImages.length}</p>
                </span>

                <button
                  className="absolute right-2 sm:right-0 p-3 bg-black/60 backdrop-blur-sm hover:bg-black/70 rounded-full text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    trackGalleryNav('next')
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
    </section>
  )
}
