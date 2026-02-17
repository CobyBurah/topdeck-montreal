export type LeadStatus =
  | 'new'
  | 'needs_more_details'
  | 'contacted'
  | 'quote_sent'
  | 'estimate_sent'
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

export type StainChoice = 'steina' | 'ligna' | 'solid'

export interface LeadPhoto {
  id: string
  lead_id: string
  storage_path: string
  original_filename: string | null
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
}

export interface LeadCustomer {
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
  additional_details: string | null
  source: LeadSource
  status: LeadStatus
  language: LeadLanguage
  internal_notes: string | null
  customer_id: string | null
  condition: LeadCondition | null
  favourite_stains?: string[] | null
  stain_choices?: StainChoice[] | null
  lead_photos?: LeadPhoto[]
  customer?: LeadCustomer
}

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'needs_more_details', label: 'Needs More Details' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'estimate_sent', label: 'Estimate Sent' },
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

export const STAIN_CHOICES: { value: StainChoice; label: string }[] = [
  { value: 'steina', label: 'Steina' },
  { value: 'ligna', label: 'Ligna' },
  { value: 'solid', label: 'BM Solid' },
]
