'use client'

import type { Lead, LeadStatus } from '@/types/lead'

interface LeadsStatsCardsProps {
  leads: Lead[]
  activeStatus: LeadStatus | 'all'
  onStatusClick: (status: LeadStatus | 'all') => void
}

export function LeadsStatsCards({ leads, activeStatus, onStatusClick }: LeadsStatsCardsProps) {
  const now = new Date()
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000)

  // New leads stats
  const newLeads = leads.filter((l) => l.status === 'new')
  const newCount = newLeads.length
  const newStaleCount = newLeads.filter((l) => new Date(l.created_at) < hoursAgo(24)).length

  // Needs more details stats
  const needsDetailsLeads = leads.filter((l) => l.status === 'needs_more_details')
  const needsDetailsCount = needsDetailsLeads.length
  const needsDetailsStaleCount = needsDetailsLeads.filter(
    (l) => new Date(l.updated_at) < hoursAgo(48)
  ).length

  // Contacted stats
  const contactedLeads = leads.filter((l) => l.status === 'contacted')
  const contactedCount = contactedLeads.length
  const contactedStaleCount = contactedLeads.filter(
    (l) => new Date(l.updated_at) < hoursAgo(24)
  ).length

  const cards = [
    {
      status: 'new' as LeadStatus,
      title: 'New',
      count: newCount,
      staleCount: newStaleCount,
      staleLabel: 'over 24h old',
      iconBg: 'bg-blue-100',
      iconBgHover: 'group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      activeBorder: 'ring-blue-500',
      icon: (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      status: 'needs_more_details' as LeadStatus,
      title: 'Needs More Details',
      count: needsDetailsCount,
      staleCount: needsDetailsStaleCount,
      staleLabel: 'over 48h in status',
      iconBg: 'bg-yellow-100',
      iconBgHover: 'group-hover:bg-yellow-200',
      iconColor: 'text-yellow-600',
      activeBorder: 'ring-yellow-500',
      icon: (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      status: 'contacted' as LeadStatus,
      title: 'Contacted',
      count: contactedCount,
      staleCount: contactedStaleCount,
      staleLabel: 'over 24h in status',
      iconBg: 'bg-purple-100',
      iconBgHover: 'group-hover:bg-purple-200',
      iconColor: 'text-purple-600',
      activeBorder: 'ring-purple-500',
      icon: (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {cards.map((card) => {
        const isActive = activeStatus === card.status
        return (
          <button
            key={card.status}
            onClick={() => onStatusClick(isActive ? 'all' : card.status)}
            className={`bg-white rounded-lg shadow-sm px-3 py-2 md:px-4 md:py-2.5 hover:shadow-md transition-all group text-left ${
              isActive ? `ring-2 ${card.activeBorder}` : ''
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`p-1.5 md:p-2 ${card.iconBg} rounded-lg ${card.iconBgHover} transition-colors ${card.iconColor} shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-secondary-500 text-[10px] md:text-xs font-medium leading-tight">{card.title}</h3>
                <p className="text-xl md:text-2xl font-bold text-secondary-900 leading-tight">{card.count}</p>
                {card.staleCount > 0 && (
                  <p className="text-[10px] md:text-xs text-secondary-400 leading-tight">
                    {card.staleCount} {card.staleLabel}
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
