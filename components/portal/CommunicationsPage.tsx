'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CommunicationTimeline } from './CommunicationTimeline'
import { MessageComposer } from './MessageComposer'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import type { Customer } from '@/types/customer'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface CommunicationsPageProps {
  initialItems: TimelineItem[]
}

type DateRange = 'all' | 'today' | 'week' | 'month' | '2026' | '2025'
type DirectionFilter = 'all' | 'inbound' | 'outbound' | 'system'

const filterByDateRange = (item: TimelineItem, range: DateRange): boolean => {
  if (range === 'all') return true

  const itemDate = new Date(item.timestamp)
  const now = new Date()

  switch (range) {
    case 'today': {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return itemDate >= todayStart
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return itemDate >= weekAgo
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return itemDate >= monthAgo
    }
    case '2026':
    case '2025':
      return itemDate.getFullYear() === parseInt(range)
    default:
      return true
  }
}

export function CommunicationsPage({ initialItems }: CommunicationsPageProps) {
  const [items, setItems] = useState(initialItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TimelineItemType | 'all'>('all')
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [composerMode, setComposerMode] = useState<'email' | 'sms' | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [replyContext, setReplyContext] = useState<{ emailId: string; subject: string } | null>(null)
  // Memoize realtime callbacks
  const handleRealtimeInsert = useCallback((newItem: TimelineItem) => {
    setItems((prev) => {
      // Insert in sorted position (most recent first)
      const newItems = [...prev]
      const insertIndex = newItems.findIndex(
        (item) => new Date(item.timestamp) < new Date(newItem.timestamp)
      )
      if (insertIndex === -1) {
        newItems.push(newItem)
      } else {
        newItems.splice(insertIndex, 0, newItem)
      }
      return newItems
    })
  }, [])

  const handleRealtimeUpdate = useCallback((updatedItem: TimelineItem) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id && item.type === updatedItem.type ? updatedItem : item
      )
    )
  }, [])

  const handleRealtimeDelete = useCallback((itemId: string, type: TimelineItemType) => {
    setItems((prev) => prev.filter((item) => !(item.id === itemId && item.type === type)))
  }, [])

  // Set up realtime subscription
  useCommunicationsRealtime({
    onItemInsert: handleRealtimeInsert,
    onItemUpdate: handleRealtimeUpdate,
    onItemDelete: handleRealtimeDelete,
  })

  // Handle reply to email
  const handleReply = useCallback((emailId: string, subject: string, customerId: string) => {
    // Find the customer from the items
    const item = items.find(i => i.id === emailId && i.type === 'email')
    if (item?.customer) {
      setSelectedCustomer({
        id: item.customer.id,
        full_name: item.customer.full_name,
        email: null, // Will be populated by the composer
        phone: null,
        address: null,
        language: 'en',
        internal_notes: null,
        created_at: '',
        updated_at: '',
      })
    }
    setReplyContext({ emailId, subject })
    setComposerMode('email')
  }, [items])

  const handleCloseComposer = useCallback(() => {
    setComposerMode(null)
    setSelectedCustomer(null)
    setReplyContext(null)
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = searchQuery.toLowerCase()

      // Search in title, description, and customer name
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        (item.description?.toLowerCase().includes(searchLower) ?? false) ||
        (item.customer?.full_name.toLowerCase().includes(searchLower) ?? false)

      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesDirection = directionFilter === 'all' || item.direction === directionFilter
      const matchesDateRange = filterByDateRange(item, dateRange)

      return matchesSearch && matchesType && matchesDirection && matchesDateRange
    })
  }, [items, searchQuery, typeFilter, directionFilter, dateRange])

  const typeOptions: { value: TimelineItemType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'call', label: 'Call' },
    { value: 'lead', label: 'Lead' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'invoice', label: 'Invoice' },
  ]

  const directionOptions: { value: DirectionFilter; label: string }[] = [
    { value: 'all', label: 'All Directions' },
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' },
    { value: 'system', label: 'System' },
  ]

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by customer, title, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TimelineItemType | 'all')}
              options={typeOptions}
            />
          </div>

          {/* Direction Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              options={directionOptions}
            />
          </div>

          {/* Date Range Filter */}
          <div className="w-full sm:w-36">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              options={dateRangeOptions}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-secondary-500">
        Showing {filteredItems.length} of {items.length} communications
      </div>

      {/* Split view: Timeline + Composer */}
      <div className="flex gap-6">
        <motion.div
          layout
          className={composerMode ? 'w-1/2' : 'w-full'}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setComposerMode('email')}
                disabled={composerMode !== null}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </Button>
              <Button
                variant="outline"
                onClick={() => setComposerMode('sms')}
                disabled={composerMode !== null}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Text Message
              </Button>
            </div>

            <CommunicationTimeline items={filteredItems} showCustomer onReply={handleReply} />
          </div>
        </motion.div>

        {composerMode && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '50%' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[500px]"
          >
            <MessageComposer
              customer={selectedCustomer}
              mode={composerMode}
              onClose={handleCloseComposer}
              onSent={handleCloseComposer}
              replyTo={replyContext || undefined}
              showCustomerSelector={!replyContext}
              onCustomerChange={setSelectedCustomer}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
