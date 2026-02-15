'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { InvoiceRow } from './InvoiceRow'
import { InvoiceModal } from './InvoiceModal'
import { useInvoicesRealtime } from '@/hooks/useInvoicesRealtime'
import { Select } from '@/components/ui/Input'
import type { Invoice, InvoiceStatus } from '@/types/invoice'
import { INVOICE_STATUSES } from '@/types/invoice'

interface InvoicesTableProps {
  initialInvoices: Invoice[]
  lastInteractions?: Record<string, string>
  initialSelectedInvoiceId?: string
}

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const filterByDateRange = (invoice: Invoice, range: DateRange): boolean => {
  if (range === 'all') return true

  const invoiceDate = new Date(invoice.created_at)
  const now = new Date()

  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return invoiceDate >= todayStart
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return invoiceDate >= weekAgo
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return invoiceDate >= monthAgo
    }
    case '2026':
    case '2025':
      return invoiceDate.getFullYear() === parseInt(range)
    default:
      return true
  }
}

export function InvoicesTable({ initialInvoices, lastInteractions = {}, initialSelectedInvoiceId }: InvoicesTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auto-open modal from initialSelectedInvoiceId (direct link) or sessionStorage
  useEffect(() => {
    const idToOpen = initialSelectedInvoiceId || sessionStorage.getItem('portal-selected-invoice')
    if (idToOpen) {
      const found = initialInvoices.find((i) => i.id === idToOpen)
      if (found) {
        setSelectedInvoice(found)
        setIsModalOpen(true)
      }
    }
  }, [initialSelectedInvoiceId, initialInvoices])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [sortField, setSortField] = useState<'created_at' | 'price' | 'customer_name' | 'status'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Memoize realtime callbacks to prevent infinite re-subscription loop
  const handleRealtimeInsert = useCallback((newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === updatedInvoice.id ? updatedInvoice : invoice))
    )
    // Update selected invoice if it's the one being updated
    setSelectedInvoice((current) => {
      if (current?.id === updatedInvoice.id) {
        return updatedInvoice
      }
      return current
    })
  }, [])

  const handleRealtimeDelete = useCallback((invoiceId: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId))
    // Close modal if deleted invoice was open
    setSelectedInvoice((current) => {
      if (current?.id === invoiceId) {
        setIsModalOpen(false)
        sessionStorage.removeItem('portal-selected-invoice')
        return null
      }
      return current
    })
  }, [])

  // Set up realtime subscription with memoized callbacks
  useInvoicesRealtime({
    onInvoiceInsert: handleRealtimeInsert,
    onInvoiceUpdate: handleRealtimeUpdate,
    onInvoiceDelete: handleRealtimeDelete,
  })

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const searchLower = searchQuery.toLowerCase()
        const customerName = invoice.customer?.full_name?.toLowerCase() ?? ''
        const customerEmail = invoice.customer?.email?.toLowerCase() ?? ''
        const customerPhone = invoice.customer?.phone?.toLowerCase() ?? ''
        const service = invoice.service?.toLowerCase() ?? ''
        const invoiceId = invoice.invoice_id?.toLowerCase() ?? ''

        const matchesSearch =
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          customerPhone.includes(searchLower) ||
          service.includes(searchLower) ||
          invoiceId.includes(searchLower)

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
        const matchesDateRange = filterByDateRange(invoice, dateRange)

        return matchesSearch && matchesStatus && matchesDateRange
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
        } else if (sortField === 'status') {
          aVal = a.status
          bVal = b.status
        } else {
          aVal = a[sortField] ?? ''
          bVal = b[sortField] ?? ''
        }

        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : 1
        }
        return aVal > bVal ? -1 : 1
      })
  }, [invoices, searchQuery, statusFilter, dateRange, sortField, sortDirection])

  const handleInvoiceUpdate = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)))
  }

  const handleInvoiceDelete = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId))
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

  const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    ...INVOICE_STATUSES,
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
              placeholder="Search by customer, service, or invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            options={statusOptions}
          />
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
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <SortIcon field="status" />
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
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    lastInteractionAt={lastInteractions[invoice.customer_id] || null}
                    onEdit={() => {
                      setSelectedInvoice(invoice)
                      setIsModalOpen(true)
                      sessionStorage.setItem('portal-selected-invoice', invoice.id)
                    }}
                    onUpdate={handleInvoiceUpdate}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="py-12 text-center text-secondary-500">
            {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
              ? 'No invoices match your filters'
              : 'No invoices yet'}
          </div>
        )}
      </div>

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedInvoice(null)
          sessionStorage.removeItem('portal-selected-invoice')
        }}
        onUpdate={handleInvoiceUpdate}
        onDelete={handleInvoiceDelete}
      />
    </div>
  )
}
