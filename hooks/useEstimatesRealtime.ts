import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Estimate } from '@/types/estimate'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseEstimatesRealtimeOptions {
  onEstimateInsert?: (estimate: Estimate) => void
  onEstimateUpdate?: (estimate: Estimate) => void
  onEstimateDelete?: (estimateId: string) => void
  onConnectionChange?: (isConnected: boolean) => void
}

const ESTIMATE_SELECT = `
  *,
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
  lead:leads (*, lead_photos (*))
`

export function useEstimatesRealtime({
  onEstimateInsert,
  onEstimateUpdate,
  onEstimateDelete,
  onConnectionChange,
}: UseEstimatesRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel('estimates-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'estimates',
          },
          async (payload) => {
            const { data } = await supabase
              .from('estimates')
              .select(ESTIMATE_SELECT)
              .eq('id', payload.new.id)
              .single()

            if (data && onEstimateInsert) {
              onEstimateInsert(data as Estimate)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'estimates',
          },
          async (payload) => {
            const { data } = await supabase
              .from('estimates')
              .select(ESTIMATE_SELECT)
              .eq('id', payload.new.id)
              .single()

            if (data && onEstimateUpdate) {
              onEstimateUpdate(data as Estimate)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'estimates',
          },
          (payload) => {
            if (onEstimateDelete) {
              onEstimateDelete(payload.old.id)
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
              .from('estimates')
              .select(ESTIMATE_SELECT)
              .eq('customer_id', payload.new.id)

            if (data && onEstimateUpdate) {
              data.forEach((estimate) => onEstimateUpdate(estimate as Estimate))
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
  }, [onEstimateInsert, onEstimateUpdate, onEstimateDelete, onConnectionChange])
}
