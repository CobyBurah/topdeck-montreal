'use client'

import { useState, useCallback, useEffect } from 'react'
import { LeadListPanel } from './LeadListPanel'
import { LeadDetailPanel } from './LeadDetailPanel'
import { LeadCommunicationsPanel } from './LeadCommunicationsPanel'
import { LeadsStatsCards } from './LeadsStatsCards'
import { useLeadsRealtime } from '@/hooks/useLeadsRealtime'
import { useCustomerTimeline } from '@/hooks/useCustomerTimeline'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import { useResizablePanels } from '@/hooks/useResizablePanels'
import type { Lead, LeadStatus } from '@/types/lead'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface LeadsThreePanelProps {
  initialLeads: Lead[]
  lastInteractions: Record<string, string>
  initialUnrepliedCustomerIds: string[]
  initialSelectedLeadId?: string
}

type MobileView = 'list' | 'detail' | 'comms'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function LeadsThreePanel({
  initialLeads,
  lastInteractions,
  initialUnrepliedCustomerIds,
  initialSelectedLeadId,
}: LeadsThreePanelProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(() => {
    if (initialSelectedLeadId) return initialSelectedLeadId
    if (typeof window !== 'undefined') return sessionStorage.getItem('portal-selected-lead')
    return null
  })
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [unrepliedCustomerIds, setUnrepliedCustomerIds] = useState<Set<string>>(
    new Set(initialUnrepliedCustomerIds)
  )
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { leftWidth, rightWidth, containerRef, renderDivider } = useResizablePanels(
    'portal-panels-leads',
    { left: 320, right: 384 }
  )

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null
  const selectedCustomerId = selectedLead?.customer_id ?? null

  // Fetch customer timeline when a lead is selected
  const { timeline, setTimeline, isLoading: isTimelineLoading } = useCustomerTimeline(selectedCustomerId)

  // Lead realtime updates
  const handleRealtimeInsert = useCallback((newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedLead: Lead) => {
    setLeads((prev) => prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)))
  }, [])

  const handleRealtimeDelete = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId))
    setSelectedLeadId((current) => {
      if (current === leadId) {
        sessionStorage.removeItem('portal-selected-lead')
        setMobileView('list')
        return null
      }
      return current
    })
  }, [])

  useLeadsRealtime({
    onLeadInsert: handleRealtimeInsert,
    onLeadUpdate: handleRealtimeUpdate,
    onLeadDelete: handleRealtimeDelete,
  })

  // Communications realtime updates for the selected customer
  const handleCommInsert = useCallback((newItem: TimelineItem) => {
    setTimeline((prev) => {
      const newItems = [...prev]
      const insertIndex = newItems.findIndex(
        (item) => new Date(item.timestamp) > new Date(newItem.timestamp)
      )
      if (insertIndex === -1) {
        newItems.push(newItem)
      } else {
        newItems.splice(insertIndex, 0, newItem)
      }
      return newItems
    })

    // Update unreplied status based on direction
    if (newItem.direction === 'inbound' && selectedCustomerId) {
      setUnrepliedCustomerIds((prev) => {
        const next = new Set(Array.from(prev))
        next.add(selectedCustomerId)
        return next
      })
    } else if (newItem.direction === 'outbound' && selectedCustomerId) {
      setUnrepliedCustomerIds((prev) => {
        const next = new Set(prev)
        next.delete(selectedCustomerId)
        return next
      })
    }
  }, [selectedCustomerId, setTimeline])

  const handleCommUpdate = useCallback((updatedItem: TimelineItem) => {
    setTimeline((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id && item.type === updatedItem.type ? updatedItem : item
      )
    )
  }, [setTimeline])

  const handleCommDelete = useCallback((itemId: string, type: TimelineItemType) => {
    setTimeline((prev) => prev.filter((item) => !(item.id === itemId && item.type === type)))
  }, [setTimeline])

  useCommunicationsRealtime({
    customerId: selectedCustomerId || undefined,
    onItemInsert: handleCommInsert,
    onItemUpdate: handleCommUpdate,
    onItemDelete: handleCommDelete,
  })

  // Handlers
  const handleSelectLead = useCallback(
    (leadId: string) => {
      setSelectedLeadId(leadId)
      sessionStorage.setItem('portal-selected-lead', leadId)
      if (!isDesktop) {
        setMobileView('detail')
      }
    },
    [isDesktop]
  )

  const handleLeadUpdate = useCallback((updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)))
  }, [])

  const handleLeadDelete = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    setSelectedLeadId(null)
    sessionStorage.removeItem('portal-selected-lead')
    setMobileView('list')
  }, [])

  // Mobile view rendering
  if (!isDesktop) {
    return (
      <div className="px-4 py-4">
        {/* Stats cards - always visible on mobile list view */}
        {mobileView === 'list' && (
          <>
            <div className="mb-4">
              <LeadsStatsCards
                leads={leads}
                activeStatus={statusFilter}
                onStatusClick={setStatusFilter}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-16rem)]">
              <LeadListPanel
                leads={leads}
                selectedLeadId={selectedLeadId}
                onSelectLead={handleSelectLead}
                unrepliedCustomerIds={unrepliedCustomerIds}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                lastInteractions={lastInteractions}
              />
            </div>
          </>
        )}

        {mobileView === 'detail' && selectedLead && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <LeadDetailPanel
              lead={selectedLead}
              onUpdate={handleLeadUpdate}
              onDelete={handleLeadDelete}
              onBack={() => setMobileView('list')}
            />
            <div className="px-4 pb-4">
              <button
                onClick={() => setMobileView('comms')}
                className="w-full py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                View Communications
              </button>
            </div>
          </div>
        )}

        {mobileView === 'comms' && selectedLead && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <LeadCommunicationsPanel
              lead={selectedLead}
              timeline={timeline}
              isLoading={isTimelineLoading}
              onBack={() => setMobileView('detail')}
            />
          </div>
        )}
      </div>
    )
  }

  // Desktop three-panel layout
  return (
    <div className="px-4 py-4">
      {/* Stats cards */}
      <div className="mb-4">
        <LeadsStatsCards
          leads={leads}
          activeStatus={statusFilter}
          onStatusClick={setStatusFilter}
        />
      </div>

      {/* Three-panel layout */}
      <div ref={containerRef} className="flex h-[calc(100vh-11rem)]">
        {/* Left Panel: Lead List */}
        <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: leftWidth }}>
          <LeadListPanel
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={handleSelectLead}
            unrepliedCustomerIds={unrepliedCustomerIds}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            lastInteractions={lastInteractions}
          />
        </div>

        {renderDivider('left')}

        {/* Center Panel: Lead Detail */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedLead ? (
            <LeadDetailPanel
              lead={selectedLead}
              onUpdate={handleLeadUpdate}
              onDelete={handleLeadDelete}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-secondary-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-secondary-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-lg font-medium">Select a lead</p>
                <p className="text-sm mt-1">Choose a lead from the list to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Communications */}
        {selectedLead && (
          <>
            {renderDivider('right')}
            <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative" style={{ width: rightWidth }}>
              <LeadCommunicationsPanel
                lead={selectedLead}
                timeline={timeline}
                isLoading={isTimelineLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
