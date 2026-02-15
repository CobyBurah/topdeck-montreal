'use client'

import { formatLastInteraction } from '@/lib/formatLastInteraction'

interface LastInteractionBadgeProps {
  lastInteractionAt: string | null | undefined
}

export function LastInteractionBadge({ lastInteractionAt }: LastInteractionBadgeProps) {
  const formatted = formatLastInteraction(lastInteractionAt)

  if (!formatted) return null

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary-100 text-secondary-500">
      {formatted}
    </span>
  )
}
