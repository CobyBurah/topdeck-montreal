'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface GalleryImage {
  id: number
  src: string
  alt: string
  title: string
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&q=80',
    alt: 'Restored wooden deck with rich stain finish',
    title: 'Cedar Deck Restoration',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    alt: 'Beautiful backyard deck with modern design',
    title: 'Modern Backyard Deck',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    alt: 'Poolside deck with protective stain coating',
    title: 'Poolside Deck',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    alt: 'Luxury outdoor living space with stained deck',
    title: 'Outdoor Living Space',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    alt: 'Freshly stained patio deck',
    title: 'Patio Refinish',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    alt: 'Multi-level deck with premium finish',
    title: 'Multi-Level Deck',
  },
]

// Split images into two rows
const topRowImages = galleryImages.filter((_, i) => i % 2 === 0)
const bottomRowImages = galleryImages.filter((_, i) => i % 2 === 1)

// Duplicate for seamless loop
const duplicatedTopRow = [...topRowImages, ...topRowImages]
const duplicatedBottomRow = [...bottomRowImages, ...bottomRowImages]

export function DeckGallery() {
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setIsPaused(true)
    startXRef.current = e.pageX - (containerRef.current?.offsetLeft || 0)
    scrollLeftRef.current = containerRef.current?.scrollLeft || 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const walk = (x - startXRef.current) * 2
    containerRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsPaused(false)
  }

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || !containerRef.current) return

    const container = containerRef.current
    let animationId: number

    const scroll = () => {
      if (container) {
        container.scrollLeft += 0.5
        // Reset scroll when reaching halfway (seamless loop)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  const ImageCard = ({ image }: { image: GalleryImage }) => (
    <div className="flex-shrink-0 w-[280px] md:w-[320px]">
      <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden group">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="320px"
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
    </section>
  )
}
