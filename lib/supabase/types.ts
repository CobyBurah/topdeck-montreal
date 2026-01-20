export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string | null
          phone: string | null
          address: string | null
          language: LeadLanguage
          internal_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          language?: LeadLanguage
          internal_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          language?: LeadLanguage
          internal_notes?: string | null
        }
      }
      leads: {
        Row: {
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
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          service_type?: string | null
          approximate_size?: string | null
          preferred_timeline?: string | null
          additional_details?: string | null
          source?: LeadSource
          status?: LeadStatus
          language?: LeadLanguage
          internal_notes?: string | null
          customer_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          service_type?: string | null
          approximate_size?: string | null
          preferred_timeline?: string | null
          additional_details?: string | null
          source?: LeadSource
          status?: LeadStatus
          language?: LeadLanguage
          internal_notes?: string | null
          customer_id?: string | null
        }
      }
      lead_photos: {
        Row: {
          id: string
          lead_id: string
          storage_path: string
          original_filename: string | null
          file_size: number | null
          mime_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          storage_path: string
          original_filename?: string | null
          file_size?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          storage_path?: string
          original_filename?: string | null
          file_size?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status: LeadStatus
      lead_source: LeadSource
    }
  }
}
