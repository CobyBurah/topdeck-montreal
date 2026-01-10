'use client'

import { motion, useInView, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) =>
    decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toString()
  )

  useEffect(() => {
    if (isInView && !shouldReduceMotion) {
      spring.set(value)
    } else if (shouldReduceMotion) {
      spring.jump(value)
    }
  }, [isInView, value, spring, shouldReduceMotion])

  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}{decimals > 0 ? value.toFixed(decimals) : value}{suffix}
      </span>
    )
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}
