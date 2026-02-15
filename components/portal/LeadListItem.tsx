'use client'

import { cn } from '@/lib/utils'
import { formatLastInteraction } from '@/lib/formatLastInteraction'
import type { Lead, LeadStatus } from '@/types/lead'

interface LeadListItemProps {
  lead: Lead
  isSelected: boolean
  hasUnrepliedMessage: boolean
  isStale: boolean
  lastInteractionAt?: string | null
  onClick: () => void
}

const ACTIVE_STATUSES: LeadStatus[] = ['new', 'needs_more_details', 'contacted', 'quote_sent']

export function isLeadStale(lead: Lead): boolean {
  if (!ACTIVE_STATUSES.includes(lead.status)) return false
  const hoursSinceUpdate = (Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60)
  return hoursSinceUpdate > 24
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  needs_more_details: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-purple-100 text-purple-700',
  quote_sent: 'bg-orange-100 text-orange-700',
  estimate_sent: 'bg-teal-100 text-teal-700',
  invoiced: 'bg-cyan-100 text-cyan-700',
  booked: 'bg-green-100 text-green-700',
  complete: 'bg-secondary-100 text-secondary-700',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  needs_more_details: 'Needs More Details',
  contacted: 'Contacted',
  quote_sent: 'Quote Sent',
  estimate_sent: 'Estimate Sent',
  invoiced: 'Invoiced',
  booked: 'Booked',
  complete: 'Complete',
}

export function LeadListItem({ lead, isSelected, hasUnrepliedMessage, isStale, lastInteractionAt, onClick }: LeadListItemProps) {
  const photos = lead.lead_photos || []
  const photoCount = photos.length

  const secondaryParts = [
    lead.address,
    photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? 's' : ''}` : null,
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
      {/* Row 1: Name + Indicators + Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {hasUnrepliedMessage && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="New or unreplied message" />
          )}
          {isStale && (
            <span title="In same status for over 24 hours">
              <svg
                className="w-3.5 h-3.5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          )}
          <span className="font-semibold text-sm text-secondary-900 truncate">
            {lead.full_name}
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
              'px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0',
              STATUS_COLORS[lead.status]
            )}
          >
            {STATUS_LABELS[lead.status]}
          </span>
        </div>
      </div>

      {/* Row 2: Service · Location · Time Ago · Photos */}
      {secondaryParts.length > 0 && (
        <div className="mt-2 text-xs text-secondary-500 truncate">
          {secondaryParts.join(' \u00B7 ')}
        </div>
      )}
    </button>
  )
}
