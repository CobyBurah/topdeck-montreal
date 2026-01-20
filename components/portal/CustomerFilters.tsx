'use client'

import { Input } from '@/components/ui/Input'

interface CustomerFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CustomerFilters({ searchQuery, onSearchChange }: CustomerFiltersProps) {
  return (
    <div className="flex-1">
      <Input
        placeholder="Search customers by name, email, or phone..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
