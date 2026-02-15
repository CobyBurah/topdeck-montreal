// Direction type shared across all communication types
export type CommunicationDirection = 'inbound' | 'outbound'

// Email types (simplified - email address derived from customer)
export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed'
export interface EmailLog {
  id: string
  customer_id: string
  direction: CommunicationDirection
  subject: string | null
  body: string | null
  external_id: string | null
  status: EmailStatus
  sent_at: string
  created_at: string
  updated_at: string
}

// SMS types (simplified - phone number derived from customer)
export interface SmsLog {
  id: string
  customer_id: string
  direction: CommunicationDirection
  message: string
  external_id: string | null
  sent_at: string
  created_at: string
  updated_at: string
}

// Call types (simplified - phone number derived from customer)
export interface CallLog {
  id: string
  customer_id: string
  direction: CommunicationDirection
  external_id: string | null
  called_at: string
  created_at: string
  updated_at: string
}

// Activity log types (permanent event storage)
export type ActivityEventType =
  | 'lead_created'
  | 'estimate_created'
  | 'invoice_created'
  | 'invoice_paid'
  | 'invoice_cancelled'
  | 'note_added'

export type ActivityReferenceType = 'lead' | 'estimate' | 'invoice'

export interface ActivityLog {
  id: string
  customer_id: string
  event_type: ActivityEventType
  reference_id: string | null
  reference_type: ActivityReferenceType | null
  title: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// Unified timeline item type
export type TimelineItemType =
  | 'email'
  | 'sms'
  | 'call'
  | 'lead'
  | 'estimate'
  | 'invoice'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  direction: CommunicationDirection | 'system' // 'system' for leads/estimates/invoices
  timestamp: string
  title: string
  description: string | null
  metadata: {
    // For emails
    subject?: string | null
    emailStatus?: EmailStatus
    // For business events
    leadId?: string
    estimateId?: string | null
    invoiceId?: string | null
    price?: number | null
    service?: string | null
    leadSource?: string
    invoiceStatus?: string
    // For scheduled messages
    scheduledFor?: string
    isScheduled?: boolean
  }
  // Optional customer info for global communications view
  customer?: {
    id: string
    full_name: string
  }
}

// Status label mappings
export const EMAIL_STATUSES: { value: EmailStatus; label: string }[] = [
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'failed', label: 'Failed' },
]

