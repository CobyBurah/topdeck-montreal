export type LeadStatus =
  | 'new'
  | 'needs_more_details'
  | 'contacted'
  | 'quote_sent'
  | 'invoiced'
  | 'booked'
  | 'complete'

export type LeadSource =
  | 'form'
  | 'email'
  | 'phone_call'
  | 'text'
  | 'manual'

export type LeadLanguage = 'en' | 'fr'

export type LeadCondition =
  | 'unstained_new'
  | 'unstained_grey'
  | 'semi_transparent'
  | 'opaque'

export interface LeadPhoto {
  id: string
  lead_id: string
  storage_path: string
  original_filename: string | null
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  service_type: string | null
  approximate_size: string | null
  preferred_timeline: string | null
  additional_details: string | null
  source: LeadSource
  status: LeadStatus
  language: LeadLanguage
  internal_notes: string | null
  customer_id: string | null
  condition: LeadCondition | null
  lead_photos?: LeadPhoto[]
}

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'needs_more_details', label: 'Needs More Details' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'booked', label: 'Booked' },
  { value: 'complete', label: 'Complete' },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'form', label: 'Form' },
  { value: 'email', label: 'Email' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'text', label: 'Text' },
  { value: 'manual', label: 'Manual' },
]

export const LEAD_LANGUAGES: { value: LeadLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
]

export const LEAD_CONDITIONS: { value: LeadCondition; label: string }[] = [
  { value: 'unstained_new', label: 'Unstained New' },
  { value: 'unstained_grey', label: 'Unstained Grey' },
  { value: 'semi_transparent', label: 'Semi-Transparent' },
  { value: 'opaque', label: 'Opaque' },
]
