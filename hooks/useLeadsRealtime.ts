import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/lead'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseLeadsRealtimeOptions {
  onLeadInsert?: (lead: Lead) => void
  onLeadUpdate?: (lead: Lead) => void
  onLeadDelete?: (leadId: string) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useLeadsRealtime({
  onLeadInsert,
  onLeadUpdate,
  onLeadDelete,
  onConnectionChange,
}: UseLeadsRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel('leads-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'leads',
          },
          async (payload) => {
            // Fetch full lead data with relations
            const { data } = await supabase
              .from('leads')
              .select(
                `
                *,
                lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
                customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onLeadInsert) {
              onLeadInsert(data as Lead)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'leads',
          },
          async (payload) => {
            // Fetch updated lead with relations
            const { data } = await supabase
              .from('leads')
              .select(
                `
                *,
                lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
                customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onLeadUpdate) {
              onLeadUpdate(data as Lead)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'leads',
          },
          (payload) => {
            if (onLeadDelete) {
              onLeadDelete(payload.old.id)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'customers',
          },
          async (payload) => {
            // Refetch all leads for this customer to update customer info
            const { data } = await supabase
              .from('leads')
              .select(
                `
                *,
                lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
                customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
              `
              )
              .eq('customer_id', payload.new.id)

            if (data && onLeadUpdate) {
              data.forEach((lead) => onLeadUpdate(lead as Lead))
            }
          }
        )
        .subscribe((status) => {
          if (onConnectionChange) {
            onConnectionChange(status === 'SUBSCRIBED')
          }
        })
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [onLeadInsert, onLeadUpdate, onLeadDelete, onConnectionChange])
}
