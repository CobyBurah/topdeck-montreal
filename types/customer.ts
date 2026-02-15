import type { Lead } from './lead'

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  language: 'en' | 'fr'
  internal_notes: string | null
  access_token: string
  leads?: Lead[]
  lead_count?: number
  last_interaction_at?: string | null
}
