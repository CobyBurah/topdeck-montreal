'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface BeforeAfterProject {
  id: number
  titleKey: string
  before: string
  after: string
}

const projects: BeforeAfterProject[] = [
  {
    id: 1,
    titleKey: 'cedarDeck',
    before: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  },
  {
    id: 2,
    titleKey: 'modernBackyard',
    before: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  },
  {
    id: 3,
    titleKey: 'poolside',
    before: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  },
  {
    id: 4,
    titleKey: 'outdoorLiving',
    before: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  },
  {
    id: 5,
    titleKey: 'patioRefinish',
    before: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  },
  {
    id: 6,
    titleKey: 'gardenDeck',
    before: 'https://images.unsplash.com/photo-1600566752734-2a0cd66c42b7?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80',
  },
  {
    id: 7,
    titleKey: 'fenceStaining',
    before: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 8,
    titleKey: 'luxuryHome',
    before: 'https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: 9,
    titleKey: 'contemporary',
    before: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  },
]

function BeforeAfterCard({ project, index, beforeLabel, afterLabel, title }: {
  project: BeforeAfterProject
  index: number
  beforeLabel: string
  afterLabel: string
  title: string
}) {
  const [sliderPosition, setSliderPosition] = useState(0) // 0 = before, 100 = after
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const positionRef = useRef(0)
  const showingBeforeRef = useRef(true)

  // Keep positionRef in sync with state
  useEffect(() => {
    positionRef.current = sliderPosition
  }, [sliderPosition])

  // Auto-animate the slider with step-based transitions
  useEffect(() => {
    if (isDragging || isHovered) {
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

      // Toggle between showing before (0) and after (100)
      const target = showingBeforeRef.current ? 100 : 0
      showingBeforeRef.current = !showingBeforeRef.current

      const duration = 800 // ms for transition
      const startPosition = positionRef.current
      const startTime = performance.now()

      const animate = () => {
        if (isCancelled) return

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
  }, [isDragging, isHovered])

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    handleMove(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    handleMove(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false)
          setIsHovered(false)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Before image - clipped to left side of slider */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={project.before}
            alt={`${title} - ${beforeLabel}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
          />
        </div>

        {/* After image - clipped to right side of slider */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <Image
            src={project.after}
            alt={`${title} - ${afterLabel}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Slider handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div
          className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-opacity duration-300"
          style={{ opacity: sliderPosition < 80 ? 1 : 0 }}
        >
          {beforeLabel}
        </div>
        <div
          className="absolute top-4 right-4 px-3 py-1.5 bg-primary-500 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-opacity duration-300"
          style={{ opacity: sliderPosition > 20 ? 1 : 0 }}
        >
          {afterLabel}
        </div>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white font-semibold text-lg">{title}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function GalleryGrid() {
  const t = useTranslations('galleryPage')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8 lg:p-12">
      {projects.map((project, index) => (
        <BeforeAfterCard
          key={project.id}
          project={project}
          index={index}
          beforeLabel={t('before')}
          afterLabel={t('after')}
          title={t(`projects.${project.titleKey}`)}
        />
      ))}
    </div>
  )
}
