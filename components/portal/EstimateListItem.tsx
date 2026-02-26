'use client'

import { cn } from '@/lib/utils'
import { formatLastInteraction } from '@/lib/formatLastInteraction'
import type { Estimate } from '@/types/estimate'

interface EstimateListItemProps {
  estimate: Estimate
  isSelected: boolean
  hasUnrepliedMessage: boolean
  lastInteractionAt?: string | null
  onClick: () => void
}

export function EstimateListItem({
  estimate,
  isSelected,
  hasUnrepliedMessage,
  lastInteractionAt,
  onClick,
}: EstimateListItemProps) {
  const customerName = estimate.customer?.full_name || estimate.lead?.full_name || 'Unknown'
  const address = estimate.lead?.address || null

  const formattedPrice = estimate.price != null
    ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(estimate.price)
    : null

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
      {/* Row 1: Name + Indicators + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {hasUnrepliedMessage && (
            <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" title="New or unreplied message" />
          )}
          <span className="font-semibold text-sm text-secondary-900 line-clamp-2">
            {customerName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastInteractionAt && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-500 whitespace-nowrap shrink-0">
              {formatLastInteraction(lastInteractionAt)}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
            estimate.status === 'invoice_sent'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-teal-100 text-teal-700'
          }`}>
            {estimate.status === 'invoice_sent' ? 'Invoice Sent' : 'Sent'}
          </span>
        </div>
      </div>

      {/* Row 2: Price · Address */}
      <div className="mt-2 flex items-center gap-2 text-xs text-secondary-500">
        {formattedPrice && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold text-xs">
            {formattedPrice}
          </span>
        )}
        {address && (
          <span className="truncate">{address}</span>
        )}
      </div>
    </button>
  )
}
