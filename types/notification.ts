export type NotificationType =
  | 'unreplied_sms'
  | 'unreplied_email'
  | 'invoice_created'
  | 'deposit_paid'
  | 'new_lead'

export interface PortalNotification {
  id: string
  type: NotificationType
  title: string
  description: string | null
  timestamp: string
  referenceId: string
  customerId: string | null
  customerName: string | null
  href: string
}
