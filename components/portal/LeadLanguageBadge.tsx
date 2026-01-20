'use client'

import { cn } from '@/lib/utils'
import type { LeadLanguage } from '@/types/lead'

const languageStyles: Record<LeadLanguage, string> = {
  en: 'bg-blue-100 text-blue-700',
  fr: 'bg-red-100 text-red-700',
}

const languageLabels: Record<LeadLanguage, string> = {
  en: 'EN',
  fr: 'FR',
}

interface LeadLanguageBadgeProps {
  language: LeadLanguage
  className?: string
}

export function LeadLanguageBadge({ language, className }: LeadLanguageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
        languageStyles[language],
        className
      )}
    >
      {languageLabels[language]}
    </span>
  )
}
