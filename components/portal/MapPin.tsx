'use client'

import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { cn } from '@/lib/utils'

export type MapItemType = 'lead' | 'estimate' | 'invoice'

interface MapPinProps {
  position: google.maps.LatLngLiteral
  type: MapItemType
  label: string
  isSelected: boolean
  onClick: () => void
}

const colorConfig: Record<MapItemType, { pill: string; tail: string }> = {
  lead: {
    pill: 'bg-blue-500',
    tail: 'border-t-blue-500',
  },
  estimate: {
    pill: 'bg-orange-500',
    tail: 'border-t-orange-500',
  },
  invoice: {
    pill: 'bg-emerald-500',
    tail: 'border-t-emerald-500',
  },
}

const icons: Record<MapItemType, React.ReactNode> = {
  lead: (
    <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  estimate: (
    <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  invoice: (
    <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function MapPin({ position, type, label, isSelected, onClick }: MapPinProps) {
  const { pill, tail } = colorConfig[type]

  return (
    <AdvancedMarker position={position} onClick={onClick} zIndex={isSelected ? 100 : 1}>
      <div className="flex flex-col items-center cursor-pointer">
        {/* Integrated pill: icon + name */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg transition-transform',
            pill,
            isSelected && 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-primary-500'
          )}
        >
          {icons[type]}
          <span className="text-xs font-semibold text-white whitespace-nowrap max-w-[120px] truncate">
            {label}
          </span>
        </div>
        {/* Pointer */}
        <div
          className={cn(
            'w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent -mt-[1px]',
            tail
          )}
        />
      </div>
    </AdvancedMarker>
  )
}
