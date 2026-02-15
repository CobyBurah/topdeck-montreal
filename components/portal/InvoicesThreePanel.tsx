'use client'

import { useState, useCallback, useEffect } from 'react'
import { InvoiceListPanel } from './InvoiceListPanel'
import { InvoiceDetailPanel } from './InvoiceDetailPanel'
import { InvoiceCommunicationsPanel } from './InvoiceCommunicationsPanel'
import { useInvoicesRealtime } from '@/hooks/useInvoicesRealtime'
import { useCustomerTimeline } from '@/hooks/useCustomerTimeline'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import { useResizablePanels } from '@/hooks/useResizablePanels'
import type { Invoice } from '@/types/invoice'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface InvoicesThreePanelProps {
  initialInvoices: Invoice[]
  lastInteractions: Record<string, string>
  initialUnrepliedCustomerIds: string[]
  initialSelectedInvoiceId?: string
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

export function InvoicesThreePanel({
  initialInvoices,
  lastInteractions,
  initialUnrepliedCustomerIds,
  initialSelectedInvoiceId,
}: InvoicesThreePanelProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(() => {
    if (initialSelectedInvoiceId) return initialSelectedInvoiceId
    if (typeof window !== 'undefined') return sessionStorage.getItem('portal-selected-invoice')
    return null
  })
  const [unrepliedCustomerIds, setUnrepliedCustomerIds] = useState<Set<string>>(
    new Set(initialUnrepliedCustomerIds)
  )
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { leftWidth, rightWidth, containerRef, renderDivider } = useResizablePanels(
    'portal-panels-invoices',
    { left: 320, right: 384 }
  )

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId) ?? null
  const selectedCustomerId = selectedInvoice?.customer_id ?? null

  // Fetch customer timeline when an invoice is selected
  const { timeline, setTimeline, isLoading: isTimelineLoading } = useCustomerTimeline(selectedCustomerId)

  // Invoice realtime updates
  const handleRealtimeInsert = useCallback((newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev])
  }, [])

  const handleRealtimeUpdate = useCallback((updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)))
  }, [])

  const handleRealtimeDelete = useCallback((invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId))
    setSelectedInvoiceId((current) => {
      if (current === invoiceId) {
        sessionStorage.removeItem('portal-selected-invoice')
        setMobileView('list')
        return null
      }
      return current
    })
  }, [])

  useInvoicesRealtime({
    onInvoiceInsert: handleRealtimeInsert,
    onInvoiceUpdate: handleRealtimeUpdate,
    onInvoiceDelete: handleRealtimeDelete,
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
  const handleSelectInvoice = useCallback(
    (invoiceId: string) => {
      setSelectedInvoiceId(invoiceId)
      sessionStorage.setItem('portal-selected-invoice', invoiceId)
      if (!isDesktop) {
        setMobileView('detail')
      }
    },
    [isDesktop]
  )

  const handleInvoiceUpdate = useCallback((updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)))
  }, [])

  const handleInvoiceDelete = useCallback((invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId))
    setSelectedInvoiceId(null)
    sessionStorage.removeItem('portal-selected-invoice')
    setMobileView('list')
  }, [])

  // Mobile view
  if (!isDesktop) {
    return (
      <div className="px-4 py-4">
        {mobileView === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-10rem)]">
            <InvoiceListPanel
              invoices={invoices}
              selectedInvoiceId={selectedInvoiceId}
              onSelectInvoice={handleSelectInvoice}
              unrepliedCustomerIds={unrepliedCustomerIds}
              lastInteractions={lastInteractions}
            />
          </div>
        )}

        {mobileView === 'detail' && selectedInvoice && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <InvoiceDetailPanel
              invoice={selectedInvoice}
              onUpdate={handleInvoiceUpdate}
              onDelete={handleInvoiceDelete}
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

        {mobileView === 'comms' && selectedInvoice && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
            <InvoiceCommunicationsPanel
              invoice={selectedInvoice}
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
        {/* Left Panel: Invoice List */}
        <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: leftWidth }}>
          <InvoiceListPanel
            invoices={invoices}
            selectedInvoiceId={selectedInvoiceId}
            onSelectInvoice={handleSelectInvoice}
            unrepliedCustomerIds={unrepliedCustomerIds}
            lastInteractions={lastInteractions}
          />
        </div>

        {renderDivider('left')}

        {/* Center Panel: Invoice Detail */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {selectedInvoice ? (
            <InvoiceDetailPanel
              invoice={selectedInvoice}
              onUpdate={handleInvoiceUpdate}
              onDelete={handleInvoiceDelete}
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
                    d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Select an invoice</p>
                <p className="text-sm mt-1">Choose an invoice from the list to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Communications */}
        {selectedInvoice && (
          <>
            {renderDivider('right')}
            <div className="shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative" style={{ width: rightWidth }}>
              <InvoiceCommunicationsPanel
                invoice={selectedInvoice}
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
