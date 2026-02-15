'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Map as GoogleMap, useMap } from '@vis.gl/react-google-maps'
import { MapPin } from '@/components/portal/MapPin'
import { MapFilterBar, type MapFilters } from '@/components/portal/MapFilterBar'
import { MapDetailPanel } from '@/components/portal/MapDetailPanel'
import { useGeocoder } from '@/hooks/useGeocoder'
import { useLeadsRealtime } from '@/hooks/useLeadsRealtime'
import { useEstimatesRealtime } from '@/hooks/useEstimatesRealtime'
import { useInvoicesRealtime } from '@/hooks/useInvoicesRealtime'
import type { Lead } from '@/types/lead'
import type { Estimate } from '@/types/estimate'
import type { Invoice } from '@/types/invoice'
import type { MapItemType } from '@/components/portal/MapPin'

interface MapViewProps {
  initialLeads: Lead[]
  initialEstimates: Estimate[]
  initialInvoices: Invoice[]
}

interface SelectedItem {
  type: MapItemType
  id: string
}

interface GeocodedPin {
  id: string
  type: MapItemType
  position: google.maps.LatLngLiteral
  label: string
  item: Lead | Estimate | Invoice
}

const MONTREAL_CENTER = { lat: 45.5017, lng: -73.5673 }
const DEFAULT_ZOOM = 11

// Active status filters (matching existing portal logic)
const ACTIVE_LEAD_STATUSES = new Set(['new', 'needs_more_details', 'contacted', 'quote_sent', 'invoiced', 'booked'])
const ACTIVE_ESTIMATE_STATUSES = new Set(['sent'])
const ACTIVE_INVOICE_STATUSES = new Set(['unpaid', 'deposit_paid'])

function getAddress(item: Lead | Estimate | Invoice, type: MapItemType): string | null {
  if (type === 'lead') {
    const lead = item as Lead
    return lead.customer?.address ?? lead.address
  }
  const withCustomer = item as Estimate | Invoice
  return withCustomer.customer?.address ?? null
}

function getLabel(item: Lead | Estimate | Invoice, type: MapItemType): string {
  if (type === 'lead') {
    const lead = item as Lead
    return lead.customer?.full_name ?? lead.full_name
  }
  const withCustomer = item as Estimate | Invoice
  return withCustomer.customer?.full_name ?? 'Unknown'
}

// Apply small offset for pins at the same coordinates
function applyJitter(pins: GeocodedPin[]): GeocodedPin[] {
  const byCoord = new Map<string, GeocodedPin[]>()
  for (const pin of pins) {
    const key = `${pin.position.lat.toFixed(6)},${pin.position.lng.toFixed(6)}`
    const group = byCoord.get(key) || []
    group.push(pin)
    byCoord.set(key, group)
  }

  const result: GeocodedPin[] = []
  Array.from(byCoord.values()).forEach(group => {
    if (group.length === 1) {
      result.push(group[0])
    } else {
      const radius = 0.0002
      group.forEach((pin, i) => {
        const angle = (2 * Math.PI * i) / group.length
        result.push({
          ...pin,
          position: {
            lat: pin.position.lat + radius * Math.cos(angle),
            lng: pin.position.lng + radius * Math.sin(angle),
          },
        })
      })
    }
  })
  return result
}

export function MapView({ initialLeads, initialEstimates, initialInvoices }: MapViewProps) {
  const map = useMap()

  // Data state
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [estimates, setEstimates] = useState<Estimate[]>(initialEstimates)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  // UI state
  const [filters, setFilters] = useState<MapFilters>({
    showLeads: true,
    showEstimates: true,
    showInvoices: true,
  })
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)

  // Filter to active items only
  const activeLeads = useMemo(() => leads.filter(l => ACTIVE_LEAD_STATUSES.has(l.status)), [leads])
  const activeEstimates = useMemo(() => estimates.filter(e => ACTIVE_ESTIMATE_STATUSES.has(e.status)), [estimates])
  const activeInvoices = useMemo(() => invoices.filter(i => ACTIVE_INVOICE_STATUSES.has(i.status)), [invoices])

  // Collect all unique addresses for geocoding
  const addresses = useMemo(() => {
    const addrSet = new Set<string>()
    activeLeads.forEach(l => { const a = getAddress(l, 'lead'); if (a) addrSet.add(a) })
    activeEstimates.forEach(e => { const a = getAddress(e, 'estimate'); if (a) addrSet.add(a) })
    activeInvoices.forEach(i => { const a = getAddress(i, 'invoice'); if (a) addrSet.add(a) })
    return Array.from(addrSet)
  }, [activeLeads, activeEstimates, activeInvoices])

  const { cache: geocodeCache, isLoading: isGeocoding, progress: geocodeProgress } = useGeocoder(addresses)

  // Build geocoded pins
  const allPins = useMemo(() => {
    const pins: GeocodedPin[] = []

    if (filters.showLeads) {
      for (const lead of activeLeads) {
        const addr = getAddress(lead, 'lead')
        if (addr && geocodeCache.has(addr)) {
          pins.push({
            id: lead.id,
            type: 'lead',
            position: geocodeCache.get(addr)!,
            label: getLabel(lead, 'lead'),
            item: lead,
          })
        }
      }
    }

    if (filters.showEstimates) {
      for (const estimate of activeEstimates) {
        const addr = getAddress(estimate, 'estimate')
        if (addr && geocodeCache.has(addr)) {
          pins.push({
            id: estimate.id,
            type: 'estimate',
            position: geocodeCache.get(addr)!,
            label: getLabel(estimate, 'estimate'),
            item: estimate,
          })
        }
      }
    }

    if (filters.showInvoices) {
      for (const invoice of activeInvoices) {
        const addr = getAddress(invoice, 'invoice')
        if (addr && geocodeCache.has(addr)) {
          pins.push({
            id: invoice.id,
            type: 'invoice',
            position: geocodeCache.get(addr)!,
            label: getLabel(invoice, 'invoice'),
            item: invoice,
          })
        }
      }
    }

    return applyJitter(pins)
  }, [filters, activeLeads, activeEstimates, activeInvoices, geocodeCache])

  // Fit map bounds to all pins after geocoding
  useEffect(() => {
    if (!map || isGeocoding || allPins.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    allPins.forEach(pin => bounds.extend(pin.position))
    map.fitBounds(bounds, { top: 80, right: 20, bottom: 20, left: 20 })
  }, [map, isGeocoding, allPins])

  // Counts for filter bar
  const counts = useMemo(() => ({
    leads: activeLeads.filter(l => { const a = getAddress(l, 'lead'); return a && geocodeCache.has(a) }).length,
    estimates: activeEstimates.filter(e => { const a = getAddress(e, 'estimate'); return a && geocodeCache.has(a) }).length,
    invoices: activeInvoices.filter(i => { const a = getAddress(i, 'invoice'); return a && geocodeCache.has(a) }).length,
  }), [activeLeads, activeEstimates, activeInvoices, geocodeCache])

  // Get the full item for the detail panel
  const selectedItemData = useMemo(() => {
    if (!selectedItem) return null
    const { type, id } = selectedItem
    if (type === 'lead') return { type, item: leads.find(l => l.id === id) }
    if (type === 'estimate') return { type, item: estimates.find(e => e.id === id) }
    if (type === 'invoice') return { type, item: invoices.find(i => i.id === id) }
    return null
  }, [selectedItem, leads, estimates, invoices])

  // Realtime callbacks
  const handleLeadInsert = useCallback((lead: Lead) => {
    setLeads(prev => [lead, ...prev.filter(l => l.id !== lead.id)])
  }, [])

  const handleLeadUpdate = useCallback((lead: Lead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l))
  }, [])

  const handleLeadDelete = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId))
    setSelectedItem(prev => prev?.type === 'lead' && prev.id === leadId ? null : prev)
  }, [])

  const handleEstimateInsert = useCallback((estimate: Estimate) => {
    setEstimates(prev => [estimate, ...prev.filter(e => e.id !== estimate.id)])
  }, [])

  const handleEstimateUpdate = useCallback((estimate: Estimate) => {
    setEstimates(prev => prev.map(e => e.id === estimate.id ? estimate : e))
  }, [])

  const handleEstimateDelete = useCallback((estimateId: string) => {
    setEstimates(prev => prev.filter(e => e.id !== estimateId))
    setSelectedItem(prev => prev?.type === 'estimate' && prev.id === estimateId ? null : prev)
  }, [])

  const handleInvoiceInsert = useCallback((invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev.filter(i => i.id !== invoice.id)])
  }, [])

  const handleInvoiceUpdate = useCallback((invoice: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i))
  }, [])

  const handleInvoiceDelete = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.filter(i => i.id !== invoiceId))
    setSelectedItem(prev => prev?.type === 'invoice' && prev.id === invoiceId ? null : prev)
  }, [])

  // Subscribe to realtime updates
  useLeadsRealtime({
    onLeadInsert: handleLeadInsert,
    onLeadUpdate: handleLeadUpdate,
    onLeadDelete: handleLeadDelete,
  })

  useEstimatesRealtime({
    onEstimateInsert: handleEstimateInsert,
    onEstimateUpdate: handleEstimateUpdate,
    onEstimateDelete: handleEstimateDelete,
  })

  useInvoicesRealtime({
    onInvoiceInsert: handleInvoiceInsert,
    onInvoiceUpdate: handleInvoiceUpdate,
    onInvoiceDelete: handleInvoiceDelete,
  })

  // Detail panel callbacks
  const handleDetailUpdate = useCallback((updated: Lead | Estimate | Invoice) => {
    if (!selectedItem) return
    if (selectedItem.type === 'lead') {
      setLeads(prev => prev.map(l => l.id === updated.id ? updated as Lead : l))
    } else if (selectedItem.type === 'estimate') {
      setEstimates(prev => prev.map(e => e.id === updated.id ? updated as Estimate : e))
    } else if (selectedItem.type === 'invoice') {
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated as Invoice : i))
    }
  }, [selectedItem])

  const handleDetailDelete = useCallback((id: string) => {
    if (!selectedItem) return
    if (selectedItem.type === 'lead') {
      setLeads(prev => prev.filter(l => l.id !== id))
    } else if (selectedItem.type === 'estimate') {
      setEstimates(prev => prev.filter(e => e.id !== id))
    } else if (selectedItem.type === 'invoice') {
      setInvoices(prev => prev.filter(i => i.id !== id))
    }
    setSelectedItem(null)
  }, [selectedItem])

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <GoogleMap
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || ''}
        defaultCenter={MONTREAL_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {allPins.map(pin => (
          <MapPin
            key={`${pin.type}-${pin.id}`}
            position={pin.position}
            type={pin.type}
            label={pin.label}
            isSelected={selectedItem?.type === pin.type && selectedItem?.id === pin.id}
            onClick={() => setSelectedItem({ type: pin.type, id: pin.id })}
          />
        ))}
      </GoogleMap>

      {/* Filter bar - centered top over the map */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <MapFilterBar
          filters={filters}
          onFilterChange={setFilters}
          counts={counts}
          isGeocoding={isGeocoding}
          geocodeProgress={geocodeProgress}
        />
      </div>

      {/* Detail panel */}
      {selectedItemData?.item && (
        <MapDetailPanel
          type={selectedItemData.type}
          item={selectedItemData.item}
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleDetailUpdate}
          onDelete={handleDetailDelete}
        />
      )}
    </div>
  )
}
