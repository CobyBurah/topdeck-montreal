export interface EstimateCustomer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  language: 'en' | 'fr'
}

export interface Estimate {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  estimate_id: string | null
  estimate_link: string | null
  service: string | null
  price: number | null
  internal_notes: string | null
  customer?: EstimateCustomer
}
