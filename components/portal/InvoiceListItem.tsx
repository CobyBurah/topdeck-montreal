'use client'

import { cn } from '@/lib/utils'
import { formatLastInteraction } from '@/lib/formatLastInteraction'
import type { Invoice, InvoiceStatus } from '@/types/invoice'

interface InvoiceListItemProps {
  invoice: Invoice
  isSelected: boolean
  hasUnrepliedMessage: boolean
  lastInteractionAt?: string | null
  onClick: () => void
}

const STATUS_STYLES: Record<InvoiceStatus, { label: string; className: string }> = {
  unpaid: { label: 'Unpaid', className: 'bg-amber-100 text-amber-700' },
  deposit_paid: { label: 'Deposit Paid', className: 'bg-blue-100 text-blue-700' },
  fully_paid: { label: 'Fully Paid', className: 'bg-green-100 text-green-700' },
}

export function InvoiceListItem({
  invoice,
  isSelected,
  hasUnrepliedMessage,
  lastInteractionAt,
  onClick,
}: InvoiceListItemProps) {
  const customerName = invoice.customer?.full_name || invoice.lead?.full_name || 'Unknown'
  const address = invoice.lead?.address || invoice.customer?.address || null

  const formattedPrice = invoice.price != null
    ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(invoice.price)
    : null

  const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.unpaid

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
          <span className={cn('px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0', statusStyle.className)}>
            {statusStyle.label}
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
