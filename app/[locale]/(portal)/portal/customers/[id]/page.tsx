import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustomerProfile } from '@/components/portal/CustomerProfile'
import type { Customer } from '@/types/customer'
import type { Lead } from '@/types/lead'
import type { Estimate } from '@/types/estimate'
import type { Invoice } from '@/types/invoice'
import type { TimelineItem, EmailLog, SmsLog, CallLog, ActivityLog } from '@/types/communication'

interface CustomerPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (customerError || !customer) {
    notFound()
  }

  // Fetch leads for this customer
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select(`
      *,
      lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at)
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
  }

  // Fetch estimates for this customer
  const { data: estimates, error: estimatesError } = await supabase
    .from('estimates')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, language)
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (estimatesError) {
    console.error('Error fetching estimates:', estimatesError)
  }

  // Fetch invoices for this customer
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, language)
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (invoicesError) {
    console.error('Error fetching invoices:', invoicesError)
  }

  // Fetch communication data and activity log
  const [emailsResult, smsResult, callsResult, activityResult] = await Promise.all([
    supabase.from('email_logs').select('*').eq('customer_id', id),
    supabase.from('sms_logs').select('*').eq('customer_id', id),
    supabase.from('call_logs').select('*').eq('customer_id', id),
    supabase.from('activity_log').select('*').eq('customer_id', id),
  ])

  // Build unified timeline
  const timeline: TimelineItem[] = []

  // Add emails
  ;(emailsResult.data as EmailLog[] | null)?.forEach((email) => {
    timeline.push({
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
  ;(smsResult.data as SmsLog[] | null)?.forEach((sms) => {
    timeline.push({
      id: sms.id,
      type: 'sms',
      direction: sms.direction,
      timestamp: sms.sent_at,
      title: 'Text Message',
      description: sms.message,
      metadata: {},
    })
  })

  // Add calls
  ;(callsResult.data as CallLog[] | null)?.forEach((call) => {
    timeline.push({
      id: call.id,
      type: 'call',
      direction: call.direction,
      timestamp: call.called_at,
      title: `${call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call`,
      description: null,
      metadata: {},
    })
  })

  // Add activity log events (leads, estimates, invoices created - persists even if source deleted)
  ;(activityResult.data as ActivityLog[] | null)?.forEach((activity) => {
    // Map event_type to timeline item type
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
    })
  })

  // Sort by timestamp descending (most recent first)
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <CustomerProfile
      customer={customer as Customer}
      leads={(leads as Lead[]) || []}
      estimates={(estimates as Estimate[]) || []}
      invoices={(invoices as Invoice[]) || []}
      timeline={timeline}
    />
  )
}
