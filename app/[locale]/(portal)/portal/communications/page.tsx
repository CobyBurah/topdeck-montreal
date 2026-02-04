import { createClient } from '@/lib/supabase/server'
import { CommunicationsPage } from '@/components/portal/CommunicationsPage'
import type { TimelineItem, EmailLog, SmsLog, CallLog, ActivityLog } from '@/types/communication'

interface EmailLogWithCustomer extends EmailLog {
  customer: { id: string; full_name: string } | null
}

interface SmsLogWithCustomer extends SmsLog {
  customer: { id: string; full_name: string } | null
}

interface CallLogWithCustomer extends CallLog {
  customer: { id: string; full_name: string } | null
}

interface ActivityLogWithCustomer extends ActivityLog {
  customer: { id: string; full_name: string } | null
}

export default async function CommunicationsPageRoute() {
  const supabase = await createClient()

  // Fetch all communication data with customer info
  const [emailsResult, smsResult, callsResult, activityResult] = await Promise.all([
    supabase
      .from('email_logs')
      .select('*, customer:customers(id, full_name)')
      .order('sent_at', { ascending: false })
      .limit(200),
    supabase
      .from('sms_logs')
      .select('*, customer:customers(id, full_name)')
      .order('sent_at', { ascending: false })
      .limit(200),
    supabase
      .from('call_logs')
      .select('*, customer:customers(id, full_name)')
      .order('called_at', { ascending: false })
      .limit(200),
    supabase
      .from('activity_log')
      .select('*, customer:customers(id, full_name)')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  // Build unified timeline
  const timeline: TimelineItem[] = []

  // Add emails
  ;(emailsResult.data as EmailLogWithCustomer[] | null)?.forEach((email) => {
    timeline.push({
      id: email.id,
      type: 'email',
      direction: email.direction,
      timestamp: email.sent_at,
      title: email.subject || '(No subject)',
      description: email.body || null,
      metadata: { subject: email.subject, emailStatus: email.status },
      customer: email.customer || undefined,
    })
  })

  // Add SMS
  ;(smsResult.data as SmsLogWithCustomer[] | null)?.forEach((sms) => {
    timeline.push({
      id: sms.id,
      type: 'sms',
      direction: sms.direction,
      timestamp: sms.sent_at,
      title: 'Text Message',
      description: sms.message,
      metadata: {},
      customer: sms.customer || undefined,
    })
  })

  // Add calls
  ;(callsResult.data as CallLogWithCustomer[] | null)?.forEach((call) => {
    timeline.push({
      id: call.id,
      type: 'call',
      direction: call.direction,
      timestamp: call.called_at,
      title: `${call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call`,
      description: null,
      metadata: {},
      customer: call.customer || undefined,
    })
  })

  // Add activity log events
  ;(activityResult.data as ActivityLogWithCustomer[] | null)?.forEach((activity) => {
    const typeMap: Record<string, 'lead' | 'estimate' | 'invoice'> = {
      lead_created: 'lead',
      estimate_created: 'estimate',
      invoice_created: 'invoice',
      invoice_paid: 'invoice',
      invoice_cancelled: 'invoice',
    }
    const type = typeMap[activity.event_type] || 'lead'

    timeline.push({
      id: activity.id,
      type,
      direction: 'system',
      timestamp: activity.created_at,
      title: activity.title,
      description: activity.description,
      metadata: activity.metadata as TimelineItem['metadata'],
      customer: activity.customer || undefined,
    })
  })

  // Sort by timestamp descending (most recent first)
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Communications</h1>
        <p className="text-secondary-600 mt-2">
          View all communications across all customers
        </p>
      </div>

      <CommunicationsPage initialItems={timeline} />
    </div>
  )
}
