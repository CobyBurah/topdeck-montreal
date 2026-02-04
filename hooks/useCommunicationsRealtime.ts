import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface UseCommunicationsRealtimeOptions {
  customerId?: string
  onItemInsert?: (item: TimelineItem) => void
  onItemUpdate?: (item: TimelineItem) => void
  onItemDelete?: (itemId: string, type: TimelineItemType) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useCommunicationsRealtime({
  customerId,
  onItemInsert,
  onItemUpdate,
  onItemDelete,
  onConnectionChange,
}: UseCommunicationsRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      const channelName = customerId
        ? `communications-${customerId}`
        : 'communications-all'

      channel = supabase.channel(channelName)

      // Email logs
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'email_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('email_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemInsert) {
              onItemInsert(transformEmailToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'email_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('email_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemUpdate) {
              onItemUpdate(transformEmailToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'email_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          (payload) => {
            if (onItemDelete) {
              onItemDelete(payload.old.id, 'email')
            }
          }
        )

      // SMS logs
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sms_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('sms_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemInsert) {
              onItemInsert(transformSmsToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sms_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('sms_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemUpdate) {
              onItemUpdate(transformSmsToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'sms_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          (payload) => {
            if (onItemDelete) {
              onItemDelete(payload.old.id, 'sms')
            }
          }
        )

      // Call logs
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'call_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('call_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemInsert) {
              onItemInsert(transformCallToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'call_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('call_logs')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemUpdate) {
              onItemUpdate(transformCallToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'call_logs',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          (payload) => {
            if (onItemDelete) {
              onItemDelete(payload.old.id, 'call')
            }
          }
        )

      // Activity log
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_log',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('activity_log')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemInsert) {
              onItemInsert(transformActivityToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'activity_log',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          async (payload) => {
            const { data } = await supabase
              .from('activity_log')
              .select('*, customer:customers(id, full_name)')
              .eq('id', payload.new.id)
              .single()

            if (data && onItemUpdate) {
              onItemUpdate(transformActivityToTimelineItem(data))
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'activity_log',
            ...(customerId && { filter: `customer_id=eq.${customerId}` }),
          },
          (payload) => {
            if (onItemDelete) {
              // Determine the type from reference_type or default to 'lead'
              const type = (payload.old.reference_type as TimelineItemType) || 'lead'
              onItemDelete(payload.old.id, type)
            }
          }
        )

      channel.subscribe((status) => {
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
  }, [customerId, onItemInsert, onItemUpdate, onItemDelete, onConnectionChange])
}

// Transform functions
interface EmailLogWithCustomer {
  id: string
  direction: 'inbound' | 'outbound'
  subject: string | null
  body: string | null
  status: string
  sent_at: string
  customer: { id: string; full_name: string } | null
}

function transformEmailToTimelineItem(email: EmailLogWithCustomer): TimelineItem {
  return {
    id: email.id,
    type: 'email',
    direction: email.direction,
    timestamp: email.sent_at,
    title: email.subject || '(No subject)',
    description: email.body || null,
    metadata: {
      subject: email.subject,
      emailStatus: email.status as TimelineItem['metadata']['emailStatus'],
    },
    customer: email.customer || undefined,
  }
}

interface SmsLogWithCustomer {
  id: string
  direction: 'inbound' | 'outbound'
  message: string
  sent_at: string
  customer: { id: string; full_name: string } | null
}

function transformSmsToTimelineItem(sms: SmsLogWithCustomer): TimelineItem {
  return {
    id: sms.id,
    type: 'sms',
    direction: sms.direction,
    timestamp: sms.sent_at,
    title: sms.direction === 'outbound' ? 'SMS Sent' : 'SMS Received',
    description: sms.message || null,
    metadata: {},
    customer: sms.customer || undefined,
  }
}

interface CallLogWithCustomer {
  id: string
  direction: 'inbound' | 'outbound'
  called_at: string
  customer: { id: string; full_name: string } | null
}

function transformCallToTimelineItem(call: CallLogWithCustomer): TimelineItem {
  return {
    id: call.id,
    type: 'call',
    direction: call.direction,
    timestamp: call.called_at,
    title: call.direction === 'outbound' ? 'Outbound Call' : 'Inbound Call',
    description: null,
    metadata: {},
    customer: call.customer || undefined,
  }
}

interface ActivityLogWithCustomer {
  id: string
  event_type: string
  reference_type: string | null
  title: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
  customer: { id: string; full_name: string } | null
}

function transformActivityToTimelineItem(activity: ActivityLogWithCustomer): TimelineItem {
  // Map event_type to timeline item type
  let type: TimelineItemType = 'lead'
  if (activity.reference_type === 'estimate' || activity.event_type === 'estimate_created') {
    type = 'estimate'
  } else if (
    activity.reference_type === 'invoice' ||
    activity.event_type.startsWith('invoice_')
  ) {
    type = 'invoice'
  }

  return {
    id: activity.id,
    type,
    direction: 'system',
    timestamp: activity.created_at,
    title: activity.title,
    description: activity.description,
    metadata: {
      leadId: activity.reference_type === 'lead' ? (activity.metadata.lead_id as string) : undefined,
      estimateId: activity.reference_type === 'estimate' ? (activity.metadata.estimate_id as string) : undefined,
      invoiceId: activity.reference_type === 'invoice' ? (activity.metadata.invoice_id as string) : undefined,
      price: activity.metadata.price as number | undefined,
      service: activity.metadata.service as string | undefined,
      leadSource: activity.metadata.source as string | undefined,
      invoiceStatus: activity.metadata.status as string | undefined,
    },
    customer: activity.customer || undefined,
  }
}
