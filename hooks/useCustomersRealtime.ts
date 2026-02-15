import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/customer'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseCustomersRealtimeOptions {
  onCustomerInsert?: (customer: Customer) => void
  onCustomerUpdate?: (customer: Customer) => void
  onCustomerDelete?: (customerId: string) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useCustomersRealtime({
  onCustomerInsert,
  onCustomerUpdate,
  onCustomerDelete,
  onConnectionChange,
}: UseCustomersRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel('customers-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customers',
          },
          async (payload) => {
            // Fetch full customer data with lead count
            const { data } = await supabase
              .from('customers')
              .select(
                `
                *,
                leads (id)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onCustomerInsert) {
              const customer: Customer = {
                ...data,
                lead_count: data.leads?.length ?? 0,
                leads: undefined,
              }
              onCustomerInsert(customer)
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
            // Fetch updated customer with lead count
            const { data } = await supabase
              .from('customers')
              .select(
                `
                *,
                leads (id)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onCustomerUpdate) {
              const customer: Customer = {
                ...data,
                lead_count: data.leads?.length ?? 0,
                leads: undefined,
              }
              onCustomerUpdate(customer)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'customers',
          },
          (payload) => {
            if (onCustomerDelete) {
              onCustomerDelete(payload.old.id)
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
  }, [onCustomerInsert, onCustomerUpdate, onCustomerDelete, onConnectionChange])
}
