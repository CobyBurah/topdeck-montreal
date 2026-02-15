'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TimelineTypeBadge } from './TimelineTypeBadge'
import type { TimelineItem as TimelineItemType, TimelineItemType as TItemType } from '@/types/communication'

const SYSTEM_EVENT_COLORS: Record<TItemType, string> = {
  email: 'bg-purple-100 text-purple-700',
  sms: 'bg-cyan-100 text-cyan-700',
  call: 'bg-green-100 text-green-700',
  lead: 'bg-blue-100 text-blue-700',
  estimate: 'bg-orange-100 text-orange-700',
  invoice: 'bg-yellow-100 text-yellow-700',
}

interface TimelineItemProps {
  item: TimelineItemType
  showCustomer?: boolean
  onReply?: (emailId: string, subject: string, customerId: string) => void
  onCancelScheduled?: (scheduledId: string) => void
}

export function TimelineItem({ item, showCustomer = false, onReply, onCancelScheduled }: TimelineItemProps) {
  const locale = useLocale()
  const isOutbound = item.direction === 'outbound'
  const isSystem = item.direction === 'system'
  const isScheduled = item.metadata.isScheduled === true

  // Get descriptive badge label based on type
  const getBadgeLabel = (): string => {
    switch (item.type) {
      case 'call':
        return item.direction === 'inbound' ? 'Incoming Call' : 'Outgoing Call'
      case 'lead':
        return 'Lead Created'
      case 'estimate':
        return 'Estimate Created'
      case 'invoice':
        return item.title
      default:
        return ''
    }
  }

  const badgeLabel = getBadgeLabel()

  // System events: single-line filled color pill
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center"
      >
        <span className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          SYSTEM_EVENT_COLORS[item.type]
        )}>
          {badgeLabel || item.title} · {formatTime(item.timestamp)}
        </span>
      </motion.div>
    )
  }

  // Communication bubbles: iMessage/WhatsApp style
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex',
        isOutbound ? 'justify-end' : 'justify-start',
        isScheduled && 'opacity-60'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3',
          isScheduled
            ? 'rounded-2xl bg-secondary-50 border border-dashed border-secondary-300'
            : isOutbound
              ? 'rounded-2xl rounded-br-sm bg-primary-100'
              : 'rounded-2xl rounded-bl-sm bg-secondary-100'
        )}
      >
        {/* Header: type badge + timestamp */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <TimelineTypeBadge type={item.type} label={badgeLabel || undefined} className="text-[10px] px-2 py-0.5" />
          <span className="text-[10px] text-secondary-400">
            {isScheduled && item.metadata.scheduledFor
              ? formatScheduledTime(item.metadata.scheduledFor)
              : formatTime(item.timestamp)}
          </span>
        </div>

        {/* Customer link */}
        {showCustomer && item.customer && (
          <Link
            href={`/${locale}/employee-portal/customers/${item.customer.id}`}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <UserIcon className="w-3 h-3" />
            {item.customer.full_name}
          </Link>
        )}

        {/* Email subject */}
        {item.type === 'email' && item.metadata.subject && (
          <p className={cn('font-semibold text-secondary-900 text-sm', (showCustomer && item.customer) && 'mt-1')}>
            {item.metadata.subject}
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className={cn(
            'text-sm text-secondary-700 whitespace-pre-wrap',
            (showCustomer && item.customer && item.type !== 'email') && 'mt-1',
            (item.type === 'email' && item.metadata.subject) && 'mt-1'
          )}>
            {item.description}
          </p>
        )}

        {/* Price display for estimates/invoices */}
        {(item.type === 'estimate' || item.type === 'invoice') && item.metadata.price && (
          <p className="mt-1 text-sm font-medium text-secondary-700">
            ${item.metadata.price.toLocaleString()}
          </p>
        )}

        {/* Actions: Reply / Cancel */}
        {(item.type === 'email' || isScheduled) && (
          <div className="mt-2 flex items-center justify-end gap-2 text-xs">
            {isScheduled && onCancelScheduled && (
              <button
                onClick={() => onCancelScheduled(item.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Cancel
              </button>
            )}
            {isScheduled && item.metadata.scheduledFor && (
              <span className="text-amber-600">
                {formatRelativeTime(item.metadata.scheduledFor)}
              </span>
            )}
            {item.type === 'email' && onReply && !isScheduled && (
              <button
                onClick={() => onReply(item.id, item.metadata.subject || '', item.customer?.id || '')}
                className="flex items-center gap-1 text-secondary-500 hover:text-primary-600 transition-colors"
              >
                <ReplyIcon className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatScheduledTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    return `in ${diffMinutes} min${diffMinutes !== 1 ? 's' : ''}`
  }
  if (diffHours < 24) return `in ${diffHours} hr${diffHours !== 1 ? 's' : ''}`
  const diffDays = Math.round(diffHours / 24)
  return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  )
}
