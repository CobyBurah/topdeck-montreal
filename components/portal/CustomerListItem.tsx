'use client'

import { cn } from '@/lib/utils'
import { formatLastInteraction } from '@/lib/formatLastInteraction'
import type { Customer } from '@/types/customer'

interface CustomerListItemProps {
  customer: Customer
  isSelected: boolean
  hasUnrepliedMessage: boolean
  lastInteractionAt?: string | null
  onClick: () => void
}

export function CustomerListItem({
  customer,
  isSelected,
  hasUnrepliedMessage,
  lastInteractionAt,
  onClick,
}: CustomerListItemProps) {
  const secondaryParts = [
    customer.email,
    customer.phone,
  ].filter(Boolean)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-5 border-b border-secondary-100 transition-colors',
        isSelected
          ? 'bg-primary-50 border-l-4 border-l-primary-500'
          : 'hover:bg-secondary-50 border-l-4 border-l-transparent'
      )}
    >
      {/* Row 1: Name + Indicators + Language Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {hasUnrepliedMessage && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Unreplied message" />
          )}
          <span className="font-semibold text-sm text-secondary-900 truncate">
            {customer.full_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastInteractionAt && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-500 whitespace-nowrap shrink-0">
              {formatLastInteraction(lastInteractionAt)}
            </span>
          )}
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0',
              customer.language === 'fr'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-secondary-100 text-secondary-700'
            )}
          >
            {customer.language === 'fr' ? 'FR' : 'EN'}
          </span>
        </div>
      </div>

      {/* Row 2: Email / Phone */}
      {secondaryParts.length > 0 && (
        <div className="mt-2 text-xs text-secondary-500 truncate">
          {secondaryParts.join(' \u00B7 ')}
        </div>
      )}
    </button>
  )
}
