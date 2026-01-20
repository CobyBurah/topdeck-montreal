'use client'

import { cn } from '@/lib/utils'
import type { LeadSource } from '@/types/lead'

const sourceStyles: Record<LeadSource, string> = {
  form: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  phone_call: 'bg-green-100 text-green-700',
  text: 'bg-cyan-100 text-cyan-700',
  manual: 'bg-secondary-100 text-secondary-700',
}

const sourceLabels: Record<LeadSource, string> = {
  form: 'Form',
  email: 'Email',
  phone_call: 'Phone Call',
  text: 'Text',
  manual: 'Manual',
}

interface LeadSourceBadgeProps {
  source: LeadSource
  className?: string
}

export function LeadSourceBadge({ source, className }: LeadSourceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        sourceStyles[source],
        className
      )}
    >
      {sourceLabels[source]}
    </span>
  )
}
