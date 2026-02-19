'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    id: 5,
    src: '/GalleryImages/5-after-Ligna-GoldenPine.avif',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
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
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const topRowRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const scrollPosRef = useRef(0)
  const oneSetWidthRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clickedImageRef = useRef<GalleryImage | null>(null)

  // Get current image index
  const currentIndex = selectedImage
    ? galleryImages.findIndex(img => img.id === selectedImage.id)
    : -1

  // Navigate to previous/next image
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedImage(galleryImages[currentIndex - 1])
    } else if (currentIndex === 0) {
      setSelectedImage(galleryImages[galleryImages.length - 1])
    }
  }, [currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < galleryImages.length - 1) {
      setSelectedImage(galleryImages[currentIndex + 1])
    } else if (currentIndex === galleryImages.length - 1) {
      setSelectedImage(galleryImages[0])
    }
  }, [currentIndex])

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
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
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
      if (deltaX > 5) setIsPaused(true)
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
      setSelectedImage(clickedImageRef.current)
    }
    setIsDragging(false)
    setIsPaused(false)
    clickedImageRef.current = null
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsPaused(false)
    clickedImageRef.current = null
  }

  const handleImageMouseDown = (image: GalleryImage) => {
    clickedImageRef.current = image
  }

  const handleTouchStart = (e: React.TouchEvent) => {
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
      if (deltaX > 5) setIsPaused(true)
    }
  }

  const handleTouchEnd = () => {
    if (!hasDragged && clickedImageRef.current) {
      setSelectedImage(clickedImageRef.current)
    }
    setIsPaused(false)
    clickedImageRef.current = null
  }

  const handleWheel = () => {
    setIsPaused(true)
  }

  // Normalize on every native scroll event (covers touch + wheel scrolling)
  const handleScroll = () => {
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
      setIsPaused(false)
    }, 3000)
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

  // Auto-scroll effect with seamless wrap
  useEffect(() => {
    if (isPaused || !containerRef.current) return

    const container = containerRef.current
    scrollPosRef.current = container.scrollLeft
    let animationId: number

    const scroll = () => {
      const oneSetWidth = oneSetWidthRef.current
      scrollPosRef.current += 0.5

      // Seamless wrap: when entering SET C, jump back to same position in SET B
      if (oneSetWidth > 0 && scrollPosRef.current >= oneSetWidth * 2) {
        scrollPosRef.current -= oneSetWidth
      }

      container.scrollLeft = scrollPosRef.current
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  // When paused by user interaction, auto-resume after 3 seconds
  useEffect(() => {
    if (isPaused) {
      scheduleResume()
    }
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [isPaused, scheduleResume])

  return (
    <section className="py-10 bg-secondary-50 overflow-hidden">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous button */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
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

            {/* Next button */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
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

            {/* Image container */}
            <motion.div
              key={selectedImage.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl px-4"
              onClick={(e) => e.stopPropagation()}
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

            {/* Image title and counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute bottom-6 left-0 right-0 text-center"
            >
              <p className="text-white text-lg font-medium">{selectedImage.title}</p>
              <p className="text-white/60 text-sm mt-1">{currentIndex + 1} / {galleryImages.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
