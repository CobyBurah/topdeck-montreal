'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EstimateRow } from './EstimateRow'
import { EstimateModal } from './EstimateModal'
import { useEstimatesRealtime } from '@/hooks/useEstimatesRealtime'
import { Select } from '@/components/ui/Input'
import type { Estimate } from '@/types/estimate'

interface EstimatesTableProps {
  initialEstimates: Estimate[]
}

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const filterByDateRange = (estimate: Estimate, range: DateRange): boolean => {
  if (range === 'all') return true

  const estimateDate = new Date(estimate.created_at)
  const now = new Date()

  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return estimateDate >= todayStart
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return estimateDate >= weekAgo
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return estimateDate >= monthAgo
    }
    case '2026':
    case '2025':
      return estimateDate.getFullYear() === parseInt(range)
    default:
      return true
  }
}

export function EstimatesTable({ initialEstimates }: EstimatesTableProps) {
  const [estimates, setEstimates] = useState(initialEstimates)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [sortField, setSortField] = useState<'created_at' | 'price' | 'customer_name'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Memoize realtime callbacks to prevent infinite re-subscription loop
  const handleRealtimeInsert = useCallback((newEstimate: Estimate) => {
    setEstimates((prev) => [newEstimate, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedEstimate: Estimate) => {
    setEstimates((prev) =>
      prev.map((estimate) => (estimate.id === updatedEstimate.id ? updatedEstimate : estimate))
    )
  }, [])

  const handleRealtimeDelete = useCallback((estimateId: string) => {
    setEstimates((prev) => prev.filter((estimate) => estimate.id !== estimateId))
    // Close modal if deleted estimate was open
    setSelectedEstimate((current) => {
      if (current?.id === estimateId) {
        setIsModalOpen(false)
        return null
      }
      return current
    })
  }, [])

  // Set up realtime subscription with memoized callbacks
  useEstimatesRealtime({
    onEstimateInsert: handleRealtimeInsert,
    onEstimateUpdate: handleRealtimeUpdate,
    onEstimateDelete: handleRealtimeDelete,
  })

  const filteredEstimates = useMemo(() => {
    return estimates
      .filter((estimate) => {
        const searchLower = searchQuery.toLowerCase()
        const customerName = estimate.customer?.full_name?.toLowerCase() ?? ''
        const customerEmail = estimate.customer?.email?.toLowerCase() ?? ''
        const customerPhone = estimate.customer?.phone?.toLowerCase() ?? ''
        const service = estimate.service?.toLowerCase() ?? ''
        const estimateId = estimate.estimate_id?.toLowerCase() ?? ''

        const matchesSearch =
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          customerPhone.includes(searchLower) ||
          service.includes(searchLower) ||
          estimateId.includes(searchLower)

        const matchesDateRange = filterByDateRange(estimate, dateRange)

        return matchesSearch && matchesDateRange
      })
      .sort((a, b) => {
        let aVal: string | number = ''
        let bVal: string | number = ''

        if (sortField === 'customer_name') {
          aVal = a.customer?.full_name ?? ''
          bVal = b.customer?.full_name ?? ''
        } else if (sortField === 'price') {
          aVal = a.price ?? 0
          bVal = b.price ?? 0
        } else {
          aVal = a[sortField] ?? ''
          bVal = b[sortField] ?? ''
        }

        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : 1
        }
        return aVal > bVal ? -1 : 1
      })
  }, [estimates, searchQuery, dateRange, sortField, sortDirection])

  const handleEstimateUpdate = (updatedEstimate: Estimate) => {
    setEstimates((prev) => prev.map((e) => (e.id === updatedEstimate.id ? updatedEstimate : e)))
  }

  const handleEstimateDelete = (estimateId: string) => {
    setEstimates((prev) => prev.filter((e) => e.id !== estimateId))
  }

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
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
              placeholder="Search by customer, service, or estimate ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            options={dateRangeOptions}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  ID
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('customer_name')}
                >
                  Name
                  <SortIcon field="customer_name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Service
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  Price
                  <SortIcon field="price" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Link
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Lang
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  Created
                  <SortIcon field="created_at" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              <AnimatePresence>
                {filteredEstimates.map((estimate) => (
                  <EstimateRow
                    key={estimate.id}
                    estimate={estimate}
                    onEdit={() => {
                      setSelectedEstimate(estimate)
                      setIsModalOpen(true)
                    }}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredEstimates.length === 0 && (
          <div className="py-12 text-center text-secondary-500">
            {searchQuery || dateRange !== 'all'
              ? 'No estimates match your filters'
              : 'No estimates yet'}
          </div>
        )}
      </div>

      <EstimateModal
        estimate={selectedEstimate}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEstimate(null)
        }}
        onUpdate={handleEstimateUpdate}
        onDelete={handleEstimateDelete}
      />
    </div>
  )
}
