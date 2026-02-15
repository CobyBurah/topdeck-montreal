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

const INVOICE_SELECT = `
  *,
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
  lead:leads (*, lead_photos (*))
`

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
            const { data } = await supabase
              .from('invoices')
              .select(INVOICE_SELECT)
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
            const { data } = await supabase
              .from('invoices')
              .select(INVOICE_SELECT)
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
            const { data } = await supabase
              .from('invoices')
              .select(INVOICE_SELECT)
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

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [onInvoiceInsert, onInvoiceUpdate, onInvoiceDelete, onConnectionChange])
}
