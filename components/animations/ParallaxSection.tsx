'use client'

import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number // 0.1 (subtle) to 0.5 (dramatic)
  direction?: 'up' | 'down'
}

export function ParallaxSection({
  children,
  className,
  speed = 0.2,
  direction = 'up',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Transform scroll progress to Y offset
  const yRange = direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed]
  const y = useTransform(scrollYProgress, [0, 1], yRange)

  // Add spring physics for smoother movement
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y: springY }}>{children}</motion.div>
    </div>
  )
}

interface ParallaxBackgroundProps {
  children: ReactNode
  backgroundElement: ReactNode
  className?: string
  speed?: number
  contentClassName?: string
}

export function ParallaxBackground({
  children,
  backgroundElement,
  className,
  speed = 0.3,
  contentClassName,
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Background moves slower than scroll, creating depth
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${30 * speed}%`])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  // Content fades out as user scrolls
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <div className="absolute inset-0">{backgroundElement}</div>
        <div className={cn('relative z-10', contentClassName)}>{children}</div>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -top-[10%] -bottom-[10%]" style={{ y: springY }}>
        {backgroundElement}
      </motion.div>

      {/* Content with fade effect */}
      <motion.div className={cn('relative z-10', contentClassName)} style={{ opacity }}>
        {children}
      </motion.div>
    </div>
  )
}
