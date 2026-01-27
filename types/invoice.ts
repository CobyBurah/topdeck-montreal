export type InvoiceStatus =
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'

export interface InvoiceCustomer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  language: 'en' | 'fr'
}

export interface Invoice {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  invoice_id: string | null
  invoice_link: string | null
  service: string | null
  price: number | null
  status: InvoiceStatus
  internal_notes: string | null
  estimate_id: string | null
  customer?: InvoiceCustomer
}

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'paid', label: 'Paid' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]
