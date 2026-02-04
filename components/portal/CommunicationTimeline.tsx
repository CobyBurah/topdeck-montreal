'use client'

import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TimelineItem } from './TimelineItem'
import type { TimelineItem as TimelineItemType } from '@/types/communication'

interface CommunicationTimelineProps {
  items: TimelineItemType[]
  showCustomer?: boolean
  onReply?: (emailId: string, subject: string, customerId: string) => void
}

export function CommunicationTimeline({ items, showCustomer = false, onReply }: CommunicationTimelineProps) {
  // Group items by date for visual separation
  const groupedItems = useMemo(() => {
    const groups: Record<string, TimelineItemType[]> = {}

    items.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString('en-CA') // YYYY-MM-DD format
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    })

    return groups
  }, [items])

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-secondary-500">
        No communication history found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date}>
          {/* Date header */}
          <div className="sticky top-0 z-10 bg-white py-2">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-secondary-200" />
              <span className="text-sm font-medium text-secondary-500">
                {formatDateHeader(date)}
              </span>
              <div className="h-px flex-1 bg-secondary-200" />
            </div>
          </div>

          {/* Items for this date */}
          <div className="space-y-4 mt-4">
            <AnimatePresence>
              {dateItems.map((item) => (
                <TimelineItem key={`${item.type}-${item.id}`} item={item} showCustomer={showCustomer} onReply={onReply} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}
