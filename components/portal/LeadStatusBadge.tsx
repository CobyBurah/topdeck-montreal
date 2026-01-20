'use client'

import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types/lead'

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  needs_more_details: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-purple-100 text-purple-700',
  quote_sent: 'bg-orange-100 text-orange-700',
  invoiced: 'bg-cyan-100 text-cyan-700',
  booked: 'bg-green-100 text-green-700',
  complete: 'bg-secondary-100 text-secondary-700',
}

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  needs_more_details: 'Needs More Details',
  contacted: 'Contacted',
  quote_sent: 'Quote Sent',
  invoiced: 'Invoiced',
  booked: 'Booked',
  complete: 'Complete',
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
