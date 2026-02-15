import type { Lead } from './lead'

export type EstimateStatus = 'sent' | 'invoice_sent'

export const ESTIMATE_STATUSES: { value: EstimateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Estimates' },
  { value: 'sent', label: 'Sent' },
  { value: 'invoice_sent', label: 'Invoice Sent' },
]

export interface EstimateCustomer {
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

export interface Estimate {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  lead_id: string | null
  estimate_id: string | null
  estimate_link: string | null
  service: string | null
  price: number | null
  status: string
  internal_notes: string | null
  favourite_stains?: string[] | null
  customer?: EstimateCustomer
  lead?: Lead
}
