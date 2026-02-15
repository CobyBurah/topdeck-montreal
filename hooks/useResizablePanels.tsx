'use client'

import { useState, useRef, useCallback, useEffect, type RefObject, type ReactNode } from 'react'

interface PanelSizes {
  left: number
  right: number
}

const MIN_LEFT = 200
const MIN_RIGHT = 250
const MIN_CENTER = 250
const DIVIDER_WIDTH = 12

export function useResizablePanels(
  storageKey: string,
  defaults: PanelSizes
): {
  leftWidth: number
  rightWidth: number
  containerRef: RefObject<HTMLDivElement | null>
  renderDivider: (position: 'left' | 'right') => ReactNode
} {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const [sizes, setSizes] = useState<PanelSizes>(() => {
    if (typeof window === 'undefined') return defaults
    try {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as PanelSizes
        if (typeof parsed.left === 'number' && typeof parsed.right === 'number') {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return defaults
  })

  const clamp = useCallback(
    (position: 'left' | 'right', value: number): number => {
      const container = containerRef.current
      if (!container) return value

      const containerWidth = container.offsetWidth
      // Account for both dividers (2 * DIVIDER_WIDTH)
      const available = containerWidth - 2 * DIVIDER_WIDTH

      if (position === 'left') {
        const maxLeft = available - MIN_CENTER - sizes.right
        return Math.max(MIN_LEFT, Math.min(value, maxLeft))
      } else {
        const maxRight = available - MIN_CENTER - sizes.left
        return Math.max(MIN_RIGHT, Math.min(value, maxRight))
      }
    },
    [sizes.left, sizes.right]
  )

  const persist = useCallback(
    (newSizes: PanelSizes) => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(newSizes))
      } catch {
        // ignore
      }
    },
    [storageKey]
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return
      e.preventDefault()

      const delta = e.clientX - startX.current

      setSizes((prev) => {
        let newSizes: PanelSizes
        if (dragging.current === 'left') {
          const newLeft = clamp('left', startWidth.current + delta)
          newSizes = { ...prev, left: newLeft }
        } else {
          // For right divider, dragging right makes right panel smaller
          const newRight = clamp('right', startWidth.current - delta)
          newSizes = { ...prev, right: newRight }
        }
        return newSizes
      })
    },
    [clamp]
  )

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    // Persist current sizes
    setSizes((current) => {
      persist(current)
      return current
    })
  }, [persist])

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const handleMouseDown = useCallback(
    (position: 'left' | 'right', e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = position
      startX.current = e.clientX
      startWidth.current = position === 'left' ? sizes.left : sizes.right
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [sizes.left, sizes.right]
  )

  const renderDivider = useCallback(
    (position: 'left' | 'right'): ReactNode => {
      return (
        <div
          className="shrink-0 flex items-center justify-center cursor-col-resize group"
          style={{ width: DIVIDER_WIDTH }}
          onMouseDown={(e) => handleMouseDown(position, e)}
        >
          <div className="w-[2px] h-8 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />
        </div>
      )
    },
    [handleMouseDown]
  )

  return {
    leftWidth: sizes.left,
    rightWidth: sizes.right,
    containerRef,
    renderDivider,
  }
}
