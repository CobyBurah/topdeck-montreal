'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TimelineTypeBadge } from './TimelineTypeBadge'
import type { TimelineItem as TimelineItemType } from '@/types/communication'

interface TimelineItemProps {
  item: TimelineItemType
  showCustomer?: boolean
  onReply?: (emailId: string, subject: string, customerId: string) => void
}

export function TimelineItem({ item, showCustomer = false, onReply }: TimelineItemProps) {
  const locale = useLocale()
  const isOutbound = item.direction === 'outbound'
  const isSystem = item.direction === 'system'

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
        // Use the title for invoice events (e.g., "Invoice Created", "Invoice Paid")
        return item.title
      default:
        // email and sms keep default labels
        return ''
    }
  }

  const badgeLabel = getBadgeLabel()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex',
        isSystem ? 'justify-center' : isOutbound ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-xl p-4 shadow-sm',
          isSystem
            ? 'bg-secondary-100 border border-secondary-200'
            : isOutbound
              ? 'bg-primary-50 border border-primary-200'
              : 'bg-white border border-secondary-200'
        )}
      >
        {/* Header with type badge and timestamp */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <TimelineTypeBadge type={item.type} label={badgeLabel || undefined} />
          <span className="text-xs text-secondary-500">
            {formatTime(item.timestamp)}
          </span>
        </div>

        {/* Customer link */}
        {showCustomer && item.customer && (
          <Link
            href={`/${locale}/portal/customers/${item.customer.id}`}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <UserIcon className="w-3 h-3" />
            {item.customer.full_name}
          </Link>
        )}

        {/* Email subject */}
        {item.type === 'email' && item.metadata.subject && (
          <p className={cn('font-semibold text-secondary-900', (showCustomer && item.customer) && 'mt-2')}>
            {item.metadata.subject}
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className={cn(
            'text-base text-secondary-700 whitespace-pre-wrap',
            (showCustomer && item.customer && item.type !== 'email') && 'mt-2',
            (item.type === 'email' && item.metadata.subject) && 'mt-1'
          )}>
            {item.description}
          </p>
        )}

        {/* Price display for estimates/invoices */}
        {(item.type === 'estimate' || item.type === 'invoice') && item.metadata.price && (
          <p className="mt-2 text-sm font-medium text-secondary-700">
            ${item.metadata.price.toLocaleString()}
          </p>
        )}

        {/* Direction indicator and actions for communication items */}
        {!isSystem && (
          <div
            className={cn(
              'mt-3 pt-2 border-t text-xs flex items-center justify-between',
              isOutbound
                ? 'border-primary-200'
                : 'border-secondary-200'
            )}
          >
            <div className={cn('flex items-center gap-1', isOutbound ? 'text-primary-600' : 'text-secondary-500')}>
              {isOutbound ? (
                <>
                  <ArrowUpRightIcon className="w-3 h-3" />
                  Sent
                </>
              ) : (
                <>
                  <ArrowDownLeftIcon className="w-3 h-3" />
                  Received
                </>
              )}
            </div>

            {/* Reply button for emails */}
            {item.type === 'email' && onReply && (
              <button
                onClick={() => onReply(item.id, item.metadata.subject || '', item.customer?.id || '')}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
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

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  )
}

function ArrowDownLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7L7 17M7 17h10M7 17V7" />
    </svg>
  )
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

