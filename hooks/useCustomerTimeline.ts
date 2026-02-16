'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface UseCustomerTimelineReturn {
  timeline: TimelineItem[]
  setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>
  isLoading: boolean
  refetch: () => void
}

export function useCustomerTimeline(customerId: string | null): UseCustomerTimelineReturn {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTimeline = useCallback(async () => {
    if (!customerId) {
      setTimeline([])
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const [emailsResult, smsResult, callsResult, activityResult, scheduledResult] = await Promise.all([
      supabase
        .from('email_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('sent_at', { ascending: false })
        .limit(100),
      supabase
        .from('sms_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('sent_at', { ascending: false })
        .limit(100),
      supabase
        .from('call_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('called_at', { ascending: false })
        .limit(100),
      supabase
        .from('activity_log')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('scheduled_messages')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(50),
    ])

    const items: TimelineItem[] = []

    // Add emails
    emailsResult.data?.forEach((email) => {
      items.push({
        id: email.id,
        type: 'email',
        direction: email.direction,
        timestamp: email.sent_at,
        title: email.subject || '(No subject)',
        description: email.body || null,
        metadata: { subject: email.subject, emailStatus: email.status },
      })
    })

    // Add SMS
    smsResult.data?.forEach((sms) => {
      items.push({
        id: sms.id,
        type: 'sms',
        direction: sms.direction,
        timestamp: sms.sent_at,
        title: sms.direction === 'outbound' ? 'SMS Sent' : 'SMS Received',
        description: sms.message || null,
        metadata: {},
      })
    })

    // Add calls
    callsResult.data?.forEach((call) => {
      items.push({
        id: call.id,
        type: 'call',
        direction: call.direction,
        timestamp: call.called_at,
        title: `${call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call`,
        description: call.summary || null,
        metadata: {},
      })
    })

    // Add activity log events
    activityResult.data?.forEach((activity) => {
      const typeMap: Record<string, TimelineItemType> = {
        lead_created: 'lead',
        estimate_created: 'estimate',
        invoice_created: 'invoice',
        invoice_paid: 'invoice',
        invoice_cancelled: 'invoice',
      }
      const type = typeMap[activity.event_type] || 'lead'

      items.push({
        id: activity.id,
        type,
        direction: 'system',
        timestamp: activity.created_at,
        title: activity.title,
        description: activity.description,
        metadata: {
          leadId: activity.reference_type === 'lead' ? (activity.metadata?.lead_id as string) : undefined,
          estimateId: activity.reference_type === 'estimate' ? (activity.metadata?.estimate_id as string) : undefined,
          invoiceId: activity.reference_type === 'invoice' ? (activity.metadata?.invoice_id as string) : undefined,
          price: activity.metadata?.price as number | undefined,
          service: activity.metadata?.service as string | undefined,
          leadSource: activity.metadata?.source as string | undefined,
          invoiceStatus: activity.metadata?.status as string | undefined,
        },
      })
    })

    // Add scheduled messages
    scheduledResult.data?.forEach((scheduled) => {
      items.push({
        id: scheduled.id,
        type: scheduled.type,
        direction: 'outbound',
        timestamp: scheduled.scheduled_for,
        title: scheduled.type === 'email' ? (scheduled.subject || '(No subject)') : 'Scheduled SMS',
        description: scheduled.message,
        metadata: {
          subject: scheduled.subject,
          scheduledFor: scheduled.scheduled_for,
          isScheduled: true,
        },
      })
    })

    // Sort by timestamp ascending (oldest first)
    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    setTimeline(items)
    setIsLoading(false)
  }, [customerId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  return { timeline, setTimeline, isLoading, refetch: fetchTimeline }
}
