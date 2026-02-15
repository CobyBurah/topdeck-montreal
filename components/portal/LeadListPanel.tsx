'use client'

import { useState, useMemo, useEffect } from 'react'
import { LeadListItem, isLeadStale } from './LeadListItem'
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@/types/lead'
import { Select } from '@/components/ui/Input'

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
]

const filterByDateRange = (lead: Lead, range: DateRange): boolean => {
  if (range === 'all') return true
  const leadDate = new Date(lead.created_at)
  const now = new Date()
  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return leadDate >= todayStart
    }
    case 'week':
      return leadDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return leadDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '2026':
    case '2025':
      return leadDate.getFullYear() === parseInt(range)
    default:
      return true
  }
}

interface LeadListPanelProps {
  leads: Lead[]
  selectedLeadId: string | null
  onSelectLead: (leadId: string) => void
  unrepliedCustomerIds: Set<string>
  statusFilter: LeadStatus | 'all'
  onStatusFilterChange: (status: LeadStatus | 'all') => void
  lastInteractions: Record<string, string>
}

export function LeadListPanel({
  leads,
  selectedLeadId,
  onSelectLead,
  unrepliedCustomerIds,
  statusFilter,
  onStatusFilterChange,
  lastInteractions,
}: LeadListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [, forceUpdate] = useState(0)

  // Re-render every 60s so stale indicators stay accurate
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...LEAD_STATUSES,
  ]

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.phone?.toLowerCase().includes(searchLower) ?? false)
        const matchesStatus = statusFilter === 'all'
          ? lead.status !== 'estimate_sent'
          : lead.status === statusFilter
        const matchesDateRange = filterByDateRange(lead, dateRange)
        return matchesSearch && matchesStatus && matchesDateRange
      })
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [leads, searchQuery, statusFilter, dateRange])

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="p-4 border-b border-secondary-200 space-y-3 shrink-0">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as LeadStatus | 'all')}
              options={statusOptions}
              className="text-xs"
            />
          </div>
          <div className="flex-1">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              options={dateRangeOptions}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Lead count */}
      <div className="px-4 py-2.5 text-xs font-medium text-secondary-500 border-b border-secondary-100 shrink-0">
        {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.map((lead) => {
          const hasUnreplied =
            lead.status === 'new' ||
            (lead.customer_id ? unrepliedCustomerIds.has(lead.customer_id) : false)

          return (
            <LeadListItem
              key={lead.id}
              lead={lead}
              isSelected={selectedLeadId === lead.id}
              hasUnrepliedMessage={hasUnreplied}
              isStale={isLeadStale(lead)}
              lastInteractionAt={lead.customer_id ? lastInteractions[lead.customer_id] : null}
              onClick={() => onSelectLead(lead.id)}
            />
          )
        })}

        {filteredLeads.length === 0 && (
          <div className="py-8 text-center text-sm text-secondary-500">
            {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
              ? 'No leads match your filters'
              : 'No leads yet'}
          </div>
        )}
      </div>
    </div>
  )
}
