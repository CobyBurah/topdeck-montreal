'use client'

import { useState, useMemo, useEffect } from 'react'
import { InvoiceListItem } from './InvoiceListItem'
import { Select } from '@/components/ui/Input'
import type { Invoice, InvoiceStatus } from '@/types/invoice'

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
]

const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'deposit_paid', label: 'Deposit Paid' },
  { value: 'fully_paid', label: 'Fully Paid' },
]

const filterByDateRange = (invoice: Invoice, range: DateRange): boolean => {
  if (range === 'all') return true
  const date = new Date(invoice.created_at)
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

interface InvoiceListPanelProps {
  invoices: Invoice[]
  selectedInvoiceId: string | null
  onSelectInvoice: (invoiceId: string) => void
  unrepliedCustomerIds: Set<string>
  lastInteractions: Record<string, string>
}

export function InvoiceListPanel({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  unrepliedCustomerIds,
  lastInteractions,
}: InvoiceListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const searchLower = searchQuery.toLowerCase()
        const customerName = invoice.customer?.full_name || invoice.lead?.full_name || ''
        const customerEmail = invoice.customer?.email || invoice.lead?.email || ''
        const customerPhone = invoice.customer?.phone || invoice.lead?.phone || ''
        const matchesSearch =
          customerName.toLowerCase().includes(searchLower) ||
          customerEmail.toLowerCase().includes(searchLower) ||
          (customerPhone.toLowerCase().includes(searchLower))
        const matchesDateRange = filterByDateRange(invoice, dateRange)
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
        return matchesSearch && matchesDateRange && matchesStatus
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [invoices, searchQuery, dateRange, statusFilter])

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
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            options={statusFilterOptions}
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
        {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInvoices.map((invoice) => {
          const hasUnreplied = unrepliedCustomerIds.has(invoice.customer_id)

          return (
            <InvoiceListItem
              key={invoice.id}
              invoice={invoice}
              isSelected={selectedInvoiceId === invoice.id}
              hasUnrepliedMessage={hasUnreplied}
              lastInteractionAt={lastInteractions[invoice.customer_id]}
              onClick={() => onSelectInvoice(invoice.id)}
            />
          )
        })}

        {filteredInvoices.length === 0 && (
          <div className="py-8 text-center text-sm text-secondary-500">
            {searchQuery || dateRange !== 'all' || statusFilter !== 'all'
              ? 'No invoices match your filters'
              : 'No invoices yet'}
          </div>
        )}
      </div>
    </div>
  )
}
