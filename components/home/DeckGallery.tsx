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
    src: '/GalleryImages/4-after-Steina-LightOak.jpeg',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 5,
    src: '/GalleryImages/5-after-Ligna-GoldenPine.JPG',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 6,
    src: '/GalleryImages/6-after-Ligna-MapleSugar.JPG',
    alt: 'Deck stained with Ligna Maple Sugar',
    title: 'Ligna Maple Sugar',
  },
  {
    id: 7,
    src: '/GalleryImages/7-after-BM-Solid-KendallCharcoal(HC-166).JPG',
    alt: 'Deck stained with Benjamin Moore Kendall Charcoal',
    title: 'Benjamin Moore Kendall Charcoal',
  },
  {
    id: 8,
    src: '/GalleryImages/8-after-BM-Semi-NaturalCedartone(ES-45).JPG',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 9,
    src: '/GalleryImages/9-after-Steina-LightOak.JPG',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 10,
    src: '/GalleryImages/10-after-BM-HiddenValley(1134).JPG',
    alt: 'Deck stained with Benjamin Moore Hidden Valley',
    title: 'Benjamin Moore Hidden Valley',
  },
  {
    id: 11,
    src: '/GalleryImages/11-after-Ligna-GoldenPine.JPG',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 12,
    src: '/GalleryImages/12-after-Steina-NaturalCedar.JPG',
    alt: 'Deck stained with Steina Natural Cedar',
    title: 'Steina Natural Cedar',
  },
  {
    id: 13,
    src: '/GalleryImages/13-after-Ligna-Camel.JPG',
    alt: 'Deck stained with Ligna Camel',
    title: 'Ligna Camel',
  },
  {
    id: 14,
    src: '/GalleryImages/14-after-Steina-LightOak.JPG',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 15,
    src: '/GalleryImages/15-after-BM-Solid-CordovanBrown(ES-62).JPG',
    alt: 'Deck stained with Benjamin Moore Cordovan Brown',
    title: 'Benjamin Moore Cordovan Brown',
  },
  {
    id: 16,
    src: '/GalleryImages/16-after-Ligna-GoldenPine.jpg',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 17,
    src: '/GalleryImages/17-after-Ligna-Paprika.jpg',
    alt: 'Deck stained with Ligna Paprika',
    title: 'Ligna Paprika',
  },
  {
    id: 18,
    src: '/GalleryImages/18-after-BM-Solid-PlatinumGray(HC-179).JPG',
    alt: 'Deck stained with Benjamin Moore Platinum Gray',
    title: 'Benjamin Moore Platinum Gray',
  },
  {
    id: 19,
    src: '/GalleryImages/19-after-BM-Semi-NaturalCedartone.jpeg',
    alt: 'Deck stained with Benjamin Moore Natural Cedartone',
    title: 'Benjamin Moore Natural Cedartone',
  },
  {
    id: 20,
    src: '/GalleryImages/20-after-Penofin-IPEOil.JPG',
    alt: 'Deck stained with Penofin IPE Oil',
    title: 'Penofin IPE Oil',
  },
  {
    id: 21,
    src: '/GalleryImages/21-after-BM-Solid-TudorBrown(HC-185).JPG',
    alt: 'Deck stained with Benjamin Moore Tudor Brown',
    title: 'Benjamin Moore Tudor Brown',
  },
  {
    id: 22,
    src: '/GalleryImages/22-after-Steina-LightOak.JPG',
    alt: 'Deck stained with Steina Light Oak',
    title: 'Steina Light Oak',
  },
  {
    id: 23,
    src: '/GalleryImages/23-after-Ligna-GoldenPine.JPG',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
  {
    id: 24,
    src: '/GalleryImages/24-after-BM-Solid-TudorBrown(HC-185).JPG',
    alt: 'Deck stained with Benjamin Moore Tudor Brown',
    title: 'Benjamin Moore Tudor Brown',
  },
  {
    id: 25,
    src: '/GalleryImages/25-after-Ligna-GoldenPine.JPG',
    alt: 'Deck stained with Ligna Golden Pine',
    title: 'Ligna Golden Pine',
  },
]

// Split images into two rows
const topRowImages = galleryImages.filter((_, i) => i % 2 === 0)
const bottomRowImages = galleryImages.filter((_, i) => i % 2 === 1)

// No duplication - each image appears once
const duplicatedTopRow = topRowImages
const duplicatedBottomRow = bottomRowImages

export function DeckGallery() {
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [hasDragged, setHasDragged] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const scrollLeftRef = useRef(0)
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
    setIsPaused(true)
    setHasDragged(false)
    startXRef.current = e.pageX
    startYRef.current = e.pageY
    scrollLeftRef.current = containerRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()

    // Only consider it a drag if moved more than 5 pixels
    const deltaX = Math.abs(e.pageX - startXRef.current)
    const deltaY = Math.abs(e.pageY - startYRef.current)
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true)
    }

    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const startX = startXRef.current - (containerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUp = () => {
    // If we didn't drag and we have a clicked image, open it
    if (!hasDragged && clickedImageRef.current) {
      setSelectedImage(clickedImageRef.current)
    }
    setIsDragging(false)
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

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || !containerRef.current) return

    const container = containerRef.current
    let animationId: number

    const scroll = () => {
      if (container) {
        container.scrollLeft += 0.5
        // Stop at the end instead of looping
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          return
        }
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  const ImageCard = ({ image }: { image: GalleryImage }) => (
    <div
      className="flex-shrink-0 w-[280px] md:w-[320px] cursor-pointer"
      onMouseDown={() => handleImageMouseDown(image)}
    >
      <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden group">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 1200px"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white font-medium text-sm">{image.title}</p>
        </div>
      </div>
    </div>
  )

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
        onMouseEnter={() => !isDragging && setIsPaused(true)}
      >
        {/* Top row */}
        <div className="flex gap-4 mb-4">
          {duplicatedTopRow.map((image, idx) => (
            <ImageCard key={`top-${image.id}-${idx}`} image={image} />
          ))}
        </div>
        {/* Bottom row - offset for visual interest */}
        <div className="flex gap-4 pl-[140px] md:pl-[160px]">
          {duplicatedBottomRow.map((image, idx) => (
            <ImageCard key={`bottom-${image.id}-${idx}`} image={image} />
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
