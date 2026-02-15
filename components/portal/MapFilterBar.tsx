'use client'

import { cn } from '@/lib/utils'

export interface MapFilters {
  showLeads: boolean
  showEstimates: boolean
  showInvoices: boolean
}

interface MapFilterBarProps {
  filters: MapFilters
  onFilterChange: (filters: MapFilters) => void
  counts: { leads: number; estimates: number; invoices: number }
  isGeocoding: boolean
  geocodeProgress: { done: number; total: number }
}

const filterItems: { key: keyof MapFilters; label: string; dotColor: string; activeColor: string }[] = [
  { key: 'showLeads', label: 'Leads', dotColor: 'bg-blue-500', activeColor: 'bg-blue-50 border-blue-300 text-blue-800' },
  { key: 'showEstimates', label: 'Estimates', dotColor: 'bg-orange-500', activeColor: 'bg-orange-50 border-orange-300 text-orange-800' },
  { key: 'showInvoices', label: 'Invoices', dotColor: 'bg-emerald-500', activeColor: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
]

export function MapFilterBar({ filters, onFilterChange, counts, isGeocoding, geocodeProgress }: MapFilterBarProps) {
  function toggle(key: keyof MapFilters) {
    onFilterChange({ ...filters, [key]: !filters[key] })
  }

  const countValues = { showLeads: counts.leads, showEstimates: counts.estimates, showInvoices: counts.invoices }

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {filterItems.map(({ key, label, dotColor, activeColor }) => {
          const isActive = filters[key]
          const count = countValues[key]

          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                isActive
                  ? activeColor
                  : 'bg-secondary-50 border-secondary-200 text-secondary-400'
              )}
            >
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', isActive ? dotColor : 'bg-secondary-300')} />
              <span className={cn(!isActive && 'line-through')}>{label}</span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',
                isActive ? 'bg-white/60' : 'bg-secondary-100 text-secondary-400'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {isGeocoding && (
        <div className="flex items-center gap-2 px-1">
          <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-xs text-secondary-500">
            Locating {geocodeProgress.done} of {geocodeProgress.total} addresses...
          </span>
        </div>
      )}
    </div>
  )
}
