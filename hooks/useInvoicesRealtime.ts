import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Invoice } from '@/types/invoice'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseInvoicesRealtimeOptions {
  onInvoiceInsert?: (invoice: Invoice) => void
  onInvoiceUpdate?: (invoice: Invoice) => void
  onInvoiceDelete?: (invoiceId: string) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useInvoicesRealtime({
  onInvoiceInsert,
  onInvoiceUpdate,
  onInvoiceDelete,
  onConnectionChange,
}: UseInvoicesRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel('invoices-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'invoices',
          },
          async (payload) => {
            // Fetch full invoice data with relations
            const { data } = await supabase
              .from('invoices')
              .select(
                `
                *,
                customer:customers (id, full_name, email, phone, language)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onInvoiceInsert) {
              onInvoiceInsert(data as Invoice)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'invoices',
          },
          async (payload) => {
            // Fetch updated invoice with relations
            const { data } = await supabase
              .from('invoices')
              .select(
                `
                *,
                customer:customers (id, full_name, email, phone, language)
              `
              )
              .eq('id', payload.new.id)
              .single()

            if (data && onInvoiceUpdate) {
              onInvoiceUpdate(data as Invoice)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'invoices',
          },
          (payload) => {
            if (onInvoiceDelete) {
              onInvoiceDelete(payload.old.id)
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
            // Refetch all invoices for this customer to update customer info
            const { data } = await supabase
              .from('invoices')
              .select(
                `
                *,
                customer:customers (id, full_name, email, phone, language)
              `
              )
              .eq('customer_id', payload.new.id)

            if (data && onInvoiceUpdate) {
              data.forEach((invoice) => onInvoiceUpdate(invoice as Invoice))
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
  }, [onInvoiceInsert, onInvoiceUpdate, onInvoiceDelete, onConnectionChange])
}
