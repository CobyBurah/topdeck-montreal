'use client'

import { cn } from '@/lib/utils'
import type { LeadCondition } from '@/types/lead'

const conditionStyles: Record<LeadCondition, string> = {
  unstained_new: 'bg-amber-100 text-amber-700',
  unstained_grey: 'bg-slate-100 text-slate-700',
  semi_transparent: 'bg-sky-100 text-sky-700',
  opaque: 'bg-indigo-100 text-indigo-700',
}

const conditionLabels: Record<LeadCondition, string> = {
  unstained_new: 'Unstained New',
  unstained_grey: 'Unstained Grey',
  semi_transparent: 'Semi-Transparent',
  opaque: 'Opaque',
}

interface LeadConditionBadgeProps {
  condition: LeadCondition | null
  className?: string
}

export function LeadConditionBadge({ condition, className }: LeadConditionBadgeProps) {
  if (!condition) {
    return <span className="text-sm text-secondary-400">-</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        conditionStyles[condition],
        className
      )}
    >
      {conditionLabels[condition]}
    </span>
  )
}
