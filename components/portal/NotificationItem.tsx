import { formatLastInteraction } from '@/lib/formatLastInteraction'
import type { PortalNotification, NotificationType } from '@/types/notification'

const typeColors: Record<NotificationType, string> = {
  unreplied_sms: 'text-blue-500',
  unreplied_email: 'text-purple-500',
  invoice_created: 'text-green-500',
  deposit_paid: 'text-emerald-600',
  new_lead: 'text-orange-500',
}

interface NotificationItemProps {
  notification: PortalNotification
  onClick: () => void
  onDismiss: () => void
}

export function NotificationItem({ notification, onClick, onDismiss }: NotificationItemProps) {
  const timeAgo = formatLastInteraction(notification.timestamp)

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-b-0 transition-colors"
      onClick={onClick}
    >
      <div className={`mt-0.5 flex-shrink-0 ${typeColors[notification.type]}`}>
        <NotificationIcon type={notification.type} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary-900 truncate">
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-xs text-secondary-500 truncate mt-0.5">
            {notification.description}
          </p>
        )}
        {timeAgo && (
          <p className="text-xs text-secondary-400 mt-1">{timeAgo}</p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
        className="flex-shrink-0 p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'unreplied_sms':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'unreplied_email':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'invoice_created':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'deposit_paid':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'new_lead':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
  }
}
