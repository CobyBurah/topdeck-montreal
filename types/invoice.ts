import type { Lead } from './lead'

export type InvoiceStatus = 'unpaid' | 'deposit_paid' | 'fully_paid'

export interface InvoiceCustomer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  language: 'en' | 'fr'
  internal_notes: string | null
  access_token?: string
  last_interaction_at?: string | null
}

export interface Invoice {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  lead_id: string | null
  invoice_id: string | null
  invoice_link: string | null
  service: string | null
  price: number | null
  status: InvoiceStatus
  internal_notes: string | null
  estimate_id: string | null
  favourite_stains?: string[] | null
  customer?: InvoiceCustomer
  lead?: Lead
}

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'deposit_paid', label: 'Deposit Paid' },
  { value: 'fully_paid', label: 'Fully Paid' },
]
