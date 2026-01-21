'use client'

import { Input, Select } from '@/components/ui/Input'
import { LEAD_STATUSES, type LeadStatus } from '@/types/lead'

export type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
]

interface LeadFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: LeadStatus | 'all'
  onStatusChange: (value: LeadStatus | 'all') => void
  dateRange: DateRange
  onDateRangeChange: (value: DateRange) => void
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
}: LeadFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...LEAD_STATUSES,
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as LeadStatus | 'all')}
          options={statusOptions}
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
          options={dateRangeOptions}
        />
      </div>
    </div>
  )
}
