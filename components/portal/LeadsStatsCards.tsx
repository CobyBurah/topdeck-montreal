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
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6">
      {cards.map((card) => {
        const isActive = activeStatus === card.status
        return (
          <button
            key={card.status}
            onClick={() => onStatusClick(isActive ? 'all' : card.status)}
            className={`bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all group text-left ${
              isActive ? `ring-2 ${card.activeBorder}` : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <div className={`p-2 md:p-3 ${card.iconBg} rounded-lg ${card.iconBgHover} transition-colors ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-secondary-600 text-xs md:text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-2xl md:text-4xl font-bold text-secondary-900 mb-1 md:mb-2">{card.count}</p>
            {card.staleCount > 0 && (
              <p className="text-xs md:text-sm text-secondary-500">
                {card.staleCount} {card.staleLabel}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
