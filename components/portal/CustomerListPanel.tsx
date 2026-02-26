'use client'

import { useState, useMemo } from 'react'
import { CustomerListItem } from './CustomerListItem'
import { Select } from '@/components/ui/Input'
import type { Customer } from '@/types/customer'

const languageOptions = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
]

interface CustomerListPanelProps {
  customers: Customer[]
  selectedCustomerId: string | null
  onSelectCustomer: (customerId: string) => void
  unrepliedCustomerIds: Set<string>
  lastInteractions: Record<string, string>
  onAddCustomer: () => void
}

export function CustomerListPanel({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  unrepliedCustomerIds,
  lastInteractions,
  onAddCustomer,
}: CustomerListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'fr'>('all')

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          customer.full_name.toLowerCase().includes(searchLower) ||
          (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
          (customer.phone?.toLowerCase().includes(searchLower) ?? false)
        const matchesLanguage = languageFilter === 'all' || customer.language === languageFilter
        return matchesSearch && matchesLanguage
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [customers, searchQuery, languageFilter])

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
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'fr')}
              options={languageOptions}
              className="text-xs"
            />
          </div>
          <button
            onClick={onAddCustomer}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shrink-0"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Customer count */}
      <div className="px-4 py-2.5 text-xs font-medium text-secondary-500 border-b border-secondary-100 shrink-0">
        {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
      </div>

      {/* Customer list */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.map((customer) => (
          <CustomerListItem
            key={customer.id}
            customer={customer}
            isSelected={selectedCustomerId === customer.id}
            hasUnrepliedMessage={unrepliedCustomerIds.has(customer.id)}
            lastInteractionAt={lastInteractions[customer.id] ?? null}
            onClick={() => onSelectCustomer(customer.id)}
          />
        ))}

        {filteredCustomers.length === 0 && (
          <div className="py-8 text-center text-sm text-secondary-500">
            {searchQuery || languageFilter !== 'all'
              ? 'No customers match your filters'
              : 'No customers yet'}
          </div>
        )}
      </div>
    </div>
  )
}
