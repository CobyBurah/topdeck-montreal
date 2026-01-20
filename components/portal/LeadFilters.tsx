'use client'

import { Input, Select } from '@/components/ui/Input'
import { LEAD_STATUSES, type LeadStatus } from '@/types/lead'

interface LeadFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: LeadStatus | 'all'
  onStatusChange: (value: LeadStatus | 'all') => void
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
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
    </div>
  )
}
