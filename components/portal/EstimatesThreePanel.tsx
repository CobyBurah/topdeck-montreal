'use client'

import { useState, useCallback, useEffect } from 'react'
import { EstimateListPanel } from './EstimateListPanel'
import { EstimateDetailPanel } from './EstimateDetailPanel'
import { EstimateCommunicationsPanel } from './EstimateCommunicationsPanel'
import { useEstimatesRealtime } from '@/hooks/useEstimatesRealtime'
import { useCustomerTimeline } from '@/hooks/useCustomerTimeline'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import { useResizablePanels } from '@/hooks/useResizablePanels'
import type { Estimate } from '@/types/estimate'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface EstimatesThreePanelProps {
  initialEstimates: Estimate[]
  lastInteractions: Record<string, string>
  initialUnrepliedCustomerIds: string[]
  initialSelectedEstimateId?: string
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

export function EstimatesThreePanel({
  initialEstimates,
  lastInteractions,
  initialUnrepliedCustomerIds,
  initialSelectedEstimateId,
}: EstimatesThreePanelProps) {
  const [estimates, setEstimates] = useState(initialEstimates)
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(() => {
    if (initialSelectedEstimateId) return initialSelectedEstimateId
    if (typeof window !== 'undefined') return sessionStorage.getItem('portal-selected-estimate')
    return null
  })
  const [unrepliedCustomerIds, setUnrepliedCustomerIds] = useState<Set<string>>(
    new Set(initialUnrepliedCustomerIds)
  )
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { leftWidth, rightWidth, containerRef, renderDivider } = useResizablePanels(
    'portal-panels-estimates',
    { left: 320, right: 384 }
  )

  const selectedEstimate = estimates.find((e) => e.id === selectedEstimateId) ?? null
  const selectedCustomerId = selectedEstimate?.customer_id ?? null

  // Fetch customer timeline when an estimate is selected
  const { timeline, setTimeline, isLoading: isTimelineLoading } = useCustomerTimeline(selectedCustomerId)

  // Estimate realtime updates
  const handleRealtimeInsert = useCallback((newEstimate: Estimate) => {
    setEstimates((prev) => [newEstimate, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedEstimate: Estimate) => {
    setEstimates((prev) => prev.map((est) => (est.id === updatedEstimate.id ? updatedEstimate : est)))
  }, [])

  const handleRealtimeDelete = useCallback((estimateId: string) => {
    setEstimates((prev) => prev.filter((est) => est.id !== estimateId))
    setSelectedEstimateId((current) => {
      if (current === estimateId) {
        sessionStorage.removeItem('portal-selected-estimate')
        setMobileView('list')
        return null
      }
      return current
    })
  }, [])

  useEstimatesRealtime({
    onEstimateInsert: handleRealtimeInsert,
    onEstimateUpdate: handleRealtimeUpdate,
    onEstimateDelete: handleRealtimeDelete,
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
  const handleSelectEstimate = useCallback(
    (estimateId: string) => {
      setSelectedEstimateId(estimateId)
      sessionStorage.setItem('portal-selected-estimate', estimateId)
      if (!isDesktop) {
        setMobileView('detail')
      }
    },
    [isDesktop]
  )

  const handleEstimateUpdate = useCallback((updatedEstimate: Estimate) => {
    setEstimates((prev) => prev.map((e) => (e.id === updatedEstimate.id ? updatedEstimate : e)))
  }, [])

  const handleEstimateDelete = useCallback((estimateId: string) => {
    setEstimates((prev) => prev.filter((e) => e.id !== estimateId))
    setSelectedEstimateId(null)
    sessionStorage.removeItem('portal-selected-estimate')
    setMobileView('list')
  }, [])

  // Mobile view
  if (!isDesktop) {
    return (
      <div className="px-4 py-4">
        {mobileView === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-10rem)]">
            <EstimateListPanel
              estimates={estimates}
              selectedEstimateId={selectedEstimateId}
              onSelectEstimate={handleSelectEstimate}
              unrepliedCustomerIds={unrepliedCustomerIds}
              lastInteractions={lastInteractions}
            />
          </div>
        )}

        {mobileView === 'detail' && selectedEstimate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <EstimateDetailPanel
              estimate={selectedEstimate}
              onUpdate={handleEstimateUpdate}
              onDelete={handleEstimateDelete}
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

        {mobileView === 'comms' && selectedEstimate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <EstimateCommunicationsPanel
              estimate={selectedEstimate}
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
      {/* Three-panel layout */}
      <div ref={containerRef} className="flex h-[calc(100vh-8rem)]">
        {/* Left Panel: Estimate List */}
        <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: leftWidth }}>
          <EstimateListPanel
            estimates={estimates}
            selectedEstimateId={selectedEstimateId}
            onSelectEstimate={handleSelectEstimate}
            unrepliedCustomerIds={unrepliedCustomerIds}
            lastInteractions={lastInteractions}
          />
        </div>

        {renderDivider('left')}

        {/* Center Panel: Estimate Detail */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedEstimate ? (
            <EstimateDetailPanel
              estimate={selectedEstimate}
              onUpdate={handleEstimateUpdate}
              onDelete={handleEstimateDelete}
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Select an estimate</p>
                <p className="text-sm mt-1">Choose an estimate from the list to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Communications */}
        {selectedEstimate && (
          <>
            {renderDivider('right')}
            <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative" style={{ width: rightWidth }}>
              <EstimateCommunicationsPanel
                estimate={selectedEstimate}
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
