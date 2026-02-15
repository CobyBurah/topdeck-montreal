'use client'

import { useState, useCallback, useEffect } from 'react'
import { CustomerListPanel } from './CustomerListPanel'
import { CustomerDetailPanel } from './CustomerDetailPanel'
import { CustomerCommunicationsPanel } from './CustomerCommunicationsPanel'
import { CustomerModal } from './CustomerModal'
import { useCustomersRealtime } from '@/hooks/useCustomersRealtime'
import { useCustomerTimeline } from '@/hooks/useCustomerTimeline'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import { useResizablePanels } from '@/hooks/useResizablePanels'
import type { Customer } from '@/types/customer'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface CustomersThreePanelProps {
  initialCustomers: Customer[]
  lastInteractions: Record<string, string>
  initialUnrepliedCustomerIds: string[]
  initialSelectedCustomerId?: string
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

export function CustomersThreePanel({
  initialCustomers,
  lastInteractions,
  initialUnrepliedCustomerIds,
  initialSelectedCustomerId,
}: CustomersThreePanelProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
    if (initialSelectedCustomerId) return initialSelectedCustomerId
    if (typeof window !== 'undefined') return sessionStorage.getItem('portal-selected-customer')
    return null
  })
  const [unrepliedCustomerIds, setUnrepliedCustomerIds] = useState<Set<string>>(
    new Set(initialUnrepliedCustomerIds)
  )
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false)

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { leftWidth, rightWidth, containerRef, renderDivider } = useResizablePanels(
    'portal-panels-customers',
    { left: 320, right: 384 }
  )

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) ?? null

  // Fetch customer timeline when a customer is selected
  const { timeline, setTimeline, isLoading: isTimelineLoading } = useCustomerTimeline(selectedCustomerId)

  // Customer realtime updates
  const handleRealtimeInsert = useCallback((newCustomer: Customer) => {
    setCustomers((prev) => {
      if (prev.some((c) => c.id === newCustomer.id)) return prev
      return [newCustomer, ...prev]
    })
  }, [])

  const handleRealtimeUpdate = useCallback((updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    )
  }, [])

  const handleRealtimeDelete = useCallback((customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
    setSelectedCustomerId((current) => {
      if (current === customerId) {
        sessionStorage.removeItem('portal-selected-customer')
        setMobileView('list')
        return null
      }
      return current
    })
  }, [])

  useCustomersRealtime({
    onCustomerInsert: handleRealtimeInsert,
    onCustomerUpdate: handleRealtimeUpdate,
    onCustomerDelete: handleRealtimeDelete,
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
  const handleSelectCustomer = useCallback(
    (customerId: string) => {
      setSelectedCustomerId(customerId)
      sessionStorage.setItem('portal-selected-customer', customerId)
      if (!isDesktop) {
        setMobileView('detail')
      }
    },
    [isDesktop]
  )

  const handleCustomerUpdate = useCallback((updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    )
  }, [])

  const handleCustomerDelete = useCallback((customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
    setSelectedCustomerId(null)
    sessionStorage.removeItem('portal-selected-customer')
    setMobileView('list')
  }, [])

  const handleCustomerCreate = useCallback((newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev])
    setSelectedCustomerId(newCustomer.id)
    sessionStorage.setItem('portal-selected-customer', newCustomer.id)
    if (!isDesktop) {
      setMobileView('detail')
    }
  }, [isDesktop])

  // Mobile view rendering
  if (!isDesktop) {
    return (
      <div className="px-4 py-4">
        {mobileView === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <CustomerListPanel
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleSelectCustomer}
              unrepliedCustomerIds={unrepliedCustomerIds}
              lastInteractions={lastInteractions}
              onAddCustomer={() => setIsNewCustomerModalOpen(true)}
            />
          </div>
        )}

        {mobileView === 'detail' && selectedCustomer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <CustomerDetailPanel
              customer={selectedCustomer}
              onUpdate={handleCustomerUpdate}
              onDelete={handleCustomerDelete}
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

        {mobileView === 'comms' && selectedCustomer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <CustomerCommunicationsPanel
              customer={selectedCustomer}
              timeline={timeline}
              isLoading={isTimelineLoading}
              onBack={() => setMobileView('detail')}
            />
          </div>
        )}

        <CustomerModal
          customer={null}
          isOpen={isNewCustomerModalOpen}
          isNew={true}
          onClose={() => setIsNewCustomerModalOpen(false)}
          onCreate={handleCustomerCreate}
        />
      </div>
    )
  }

  // Desktop three-panel layout
  return (
    <div className="px-4 py-4">
      {/* Three-panel layout */}
      <div ref={containerRef} className="flex h-[calc(100vh-7rem)]">
        {/* Left Panel: Customer List */}
        <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: leftWidth }}>
          <CustomerListPanel
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            unrepliedCustomerIds={unrepliedCustomerIds}
            lastInteractions={lastInteractions}
            onAddCustomer={() => setIsNewCustomerModalOpen(true)}
          />
        </div>

        {renderDivider('left')}

        {/* Center Panel: Customer Detail */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedCustomer ? (
            <CustomerDetailPanel
              customer={selectedCustomer}
              onUpdate={handleCustomerUpdate}
              onDelete={handleCustomerDelete}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-lg font-medium">Select a customer</p>
                <p className="text-sm mt-1">Choose a customer from the list to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Communications */}
        {selectedCustomer && (
          <>
            {renderDivider('right')}
            <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative" style={{ width: rightWidth }}>
              <CustomerCommunicationsPanel
                customer={selectedCustomer}
                timeline={timeline}
                isLoading={isTimelineLoading}
              />
            </div>
          </>
        )}
      </div>

      <CustomerModal
        customer={null}
        isOpen={isNewCustomerModalOpen}
        isNew={true}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCreate={handleCustomerCreate}
      />
    </div>
  )
}
