'use client'

import { useState, useMemo, useEffect } from 'react'
import { EstimateListItem } from './EstimateListItem'
import { Select } from '@/components/ui/Input'
import type { Estimate } from '@/types/estimate'
import { ESTIMATE_STATUSES, type EstimateStatus } from '@/types/estimate'

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
]

const filterByDateRange = (estimate: Estimate, range: DateRange): boolean => {
  if (range === 'all') return true
  const date = new Date(estimate.created_at)
  const now = new Date()
  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return date >= todayStart
    }
    case 'week':
      return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '2026':
    case '2025':
      return date.getFullYear() === parseInt(range)
    default:
      return true
  }
}

interface EstimateListPanelProps {
  estimates: Estimate[]
  selectedEstimateId: string | null
  onSelectEstimate: (estimateId: string) => void
  unrepliedCustomerIds: Set<string>
  lastInteractions: Record<string, string>
}

export function EstimateListPanel({
  estimates,
  selectedEstimateId,
  onSelectEstimate,
  unrepliedCustomerIds,
  lastInteractions,
}: EstimateListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [statusFilter, setStatusFilter] = useState<EstimateStatus | 'all'>('sent')
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredEstimates = useMemo(() => {
    return estimates
      .filter((estimate) => {
        const searchLower = searchQuery.toLowerCase()
        const customerName = estimate.customer?.full_name || estimate.lead?.full_name || ''
        const customerEmail = estimate.customer?.email || estimate.lead?.email || ''
        const customerPhone = estimate.customer?.phone || estimate.lead?.phone || ''
        const matchesSearch =
          customerName.toLowerCase().includes(searchLower) ||
          customerEmail.toLowerCase().includes(searchLower) ||
          (customerPhone.toLowerCase().includes(searchLower))
        const matchesDateRange = filterByDateRange(estimate, dateRange)
        const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter
        return matchesSearch && matchesDateRange && matchesStatus
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [estimates, searchQuery, dateRange, statusFilter])

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
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EstimateStatus | 'all')}
            options={ESTIMATE_STATUSES}
            className="text-xs flex-1"
          />
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            options={dateRangeOptions}
            className="text-xs flex-1"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2.5 text-xs font-medium text-secondary-500 border-b border-secondary-100 shrink-0">
        {filteredEstimates.length} estimate{filteredEstimates.length !== 1 ? 's' : ''}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEstimates.map((estimate) => {
          const hasUnreplied = unrepliedCustomerIds.has(estimate.customer_id)

          return (
            <EstimateListItem
              key={estimate.id}
              estimate={estimate}
              isSelected={selectedEstimateId === estimate.id}
              hasUnrepliedMessage={hasUnreplied}
              lastInteractionAt={lastInteractions[estimate.customer_id]}
              onClick={() => onSelectEstimate(estimate.id)}
            />
          )
        })}

        {filteredEstimates.length === 0 && (
          <div className="py-8 text-center text-sm text-secondary-500">
            {searchQuery || dateRange !== 'all' || statusFilter !== 'sent'
              ? 'No estimates match your filters'
              : 'No estimates yet'}
          </div>
        )}
      </div>
    </div>
  )
}
