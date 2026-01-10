'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  duration?: number
  distance?: number
  delay?: number
}

export function FloatingElement({
  children,
  className,
  duration = 4,
  distance = 15,
  delay = 0,
}: FloatingElementProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Subtle pulsing glow effect
export function PulseGlow({
  children,
  className,
  duration = 2,
}: Omit<FloatingElementProps, 'distance' | 'delay'>) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={{
        opacity: [0.7, 1, 0.7],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
