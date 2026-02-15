'use client'

import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LeadRow } from './LeadRow'
import { LeadModal } from './LeadModal'
import { LeadFilters, type DateRange } from './LeadFilters'
import { LeadsStatsCards } from './LeadsStatsCards'
import { useLeadsRealtime } from '@/hooks/useLeadsRealtime'
import type { Lead, LeadStatus } from '@/types/lead'

interface LeadsTableProps {
  initialLeads: Lead[]
  showStatsCards?: boolean
  lastInteractions?: Record<string, string>
}

const filterByDateRange = (lead: Lead, range: DateRange): boolean => {
  if (range === 'all') return true

  const leadDate = new Date(lead.created_at)
  const now = new Date()

  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return leadDate >= todayStart
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return leadDate >= weekAgo
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return leadDate >= monthAgo
    }
    case '2026':
    case '2025':
      return leadDate.getFullYear() === parseInt(range)
    default:
      return true
  }
}

export function LeadsTable({ initialLeads, showStatsCards = true, lastInteractions = {} }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [sortField, setSortField] = useState<'created_at' | 'updated_at' | 'full_name' | 'status'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Memoize realtime callbacks to prevent infinite re-subscription loop
  const handleRealtimeInsert = useCallback((newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    )
  }, [])

  const handleRealtimeDelete = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId))
    // Close modal if deleted lead was open
    setSelectedLead((current) => {
      if (current?.id === leadId) {
        setIsModalOpen(false)
        return null
      }
      return current
    })
  }, [])

  const handleConnectionChange = useCallback((isConnected: boolean) => {
    setIsRealtimeConnected(isConnected)
  }, [])

  // Set up realtime subscription with memoized callbacks
  useLeadsRealtime({
    onLeadInsert: handleRealtimeInsert,
    onLeadUpdate: handleRealtimeUpdate,
    onLeadDelete: handleRealtimeDelete,
    onConnectionChange: handleConnectionChange,
  })

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.phone?.toLowerCase().includes(searchLower) ?? false)

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
        const matchesDateRange = filterByDateRange(lead, dateRange)

        return matchesSearch && matchesStatus && matchesDateRange
      })
      .sort((a, b) => {
        const aVal = a[sortField] ?? ''
        const bVal = b[sortField] ?? ''
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : 1
        }
        return aVal > bVal ? -1 : 1
      })
  }, [leads, searchQuery, statusFilter, dateRange, sortField, sortDirection])

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)))
  }

  const handleLeadDelete = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
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

  return (
    <div className="space-y-6">
      {showStatsCards && (
        <LeadsStatsCards
          leads={leads}
          activeStatus={statusFilter}
          onStatusClick={setStatusFilter}
        />
      )}

      <LeadFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('full_name')}
                >
                  Name
                  <SortIcon field="full_name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Condition
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Photos
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
                {filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    lastInteractionAt={lead.customer_id ? lastInteractions[lead.customer_id] || null : null}
                    onEdit={() => {
                      setSelectedLead(lead)
                      setIsModalOpen(true)
                    }}
                    onUpdate={handleLeadUpdate}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="py-12 text-center text-secondary-500">
            {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
              ? 'No leads match your filters'
              : 'No leads yet'}
          </div>
        )}
      </div>

      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedLead(null)
        }}
        onUpdate={handleLeadUpdate}
        onDelete={handleLeadDelete}
      />
    </div>
  )
}
