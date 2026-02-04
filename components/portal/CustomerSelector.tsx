'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/customer'

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void
  selectedCustomer: Customer | null
  filterByEmail?: boolean
  filterByPhone?: boolean
  placeholder?: string
}

export function CustomerSelector({
  onSelect,
  selectedCustomer,
  filterByEmail = false,
  filterByPhone = false,
  placeholder = 'Search for a customer...',
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        console.error('Error fetching customers:', error)
        return
      }

      // Filter based on props
      let filtered = data || []
      if (filterByEmail) {
        filtered = filtered.filter((c) => c.email)
      }
      if (filterByPhone) {
        filtered = filtered.filter((c) => c.phone)
      }

      setCustomers(filtered)
      setFilteredCustomers(filtered)
      setIsLoading(false)
    }

    fetchCustomers()
  }, [filterByEmail, filterByPhone])

  // Filter customers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onSelect(null as unknown as Customer)
    setSearchQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-secondary-700 mb-1">To</label>

      {selectedCustomer ? (
        // Show selected customer
        <div className="flex items-center justify-between px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-secondary-900">{selectedCustomer.full_name}</span>
            <span className="text-secondary-500">
              &lt;{filterByEmail ? selectedCustomer.email : selectedCustomer.phone}&gt;
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-secondary-200 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        // Show search input
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !selectedCustomer && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-secondary-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-4 py-3 text-sm text-secondary-500">
              {searchQuery ? 'No customers found' : 'No customers available'}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelect(customer)}
                className="w-full px-4 py-2 text-left hover:bg-secondary-50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-secondary-900">{customer.full_name}</span>
                <span className="text-sm text-secondary-500">
                  {filterByEmail ? customer.email : customer.phone}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
