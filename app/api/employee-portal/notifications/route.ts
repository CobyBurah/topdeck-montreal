import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PortalNotification } from '@/types/notification'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notifications: PortalNotification[] = []
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Fetch all 5 sources in parallel
  const [
    unrepliedSmsResult,
    unrepliedEmailsResult,
    invoiceCreatedResult,
    depositPaidResult,
    newLeadsResult,
  ] = await Promise.all([
    supabase.rpc('get_unreplied_sms'),
    supabase.rpc('get_unreplied_emails'),
    supabase
      .from('activity_log')
      .select('id, customer_id, reference_id, title, description, created_at, metadata')
      .eq('event_type', 'invoice_created')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id, customer_id, service, price, status, updated_at, customer:customers (id, full_name)')
      .eq('status', 'deposit_paid')
      .gte('updated_at', sevenDaysAgo)
      .order('updated_at', { ascending: false }),
    supabase
      .from('leads')
      .select('id, full_name, service_type, address, status, created_at, customer_id, customer:customers (id, full_name)')
      .eq('status', 'new')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false }),
  ])

  // 1. Unreplied SMS
  if (unrepliedSmsResult.data) {
    for (const sms of unrepliedSmsResult.data) {
      notifications.push({
        id: `unreplied_sms_${sms.id}`,
        type: 'unreplied_sms',
        title: `Unreplied SMS from ${sms.customer_name}`,
        description: sms.message?.substring(0, 100) || null,
        timestamp: sms.sent_at,
        referenceId: sms.id,
        customerId: sms.customer_id,
        customerName: sms.customer_name,
        href: `/employee-portal/customers?customerId=${sms.customer_id}`,
      })
    }
  }

  // 2. Unreplied Emails
  if (unrepliedEmailsResult.data) {
    for (const email of unrepliedEmailsResult.data) {
      notifications.push({
        id: `unreplied_email_${email.id}`,
        type: 'unreplied_email',
        title: `Unreplied email from ${email.customer_name}`,
        description: email.subject || '(No subject)',
        timestamp: email.sent_at,
        referenceId: email.id,
        customerId: email.customer_id,
        customerName: email.customer_name,
        href: `/employee-portal/customers?customerId=${email.customer_id}`,
      })
    }
  }

  // 3. Invoice Created
  if (invoiceCreatedResult.data) {
    for (const log of invoiceCreatedResult.data) {
      const metadata = log.metadata as Record<string, unknown> | null
      notifications.push({
        id: `invoice_created_${log.id}`,
        type: 'invoice_created',
        title: `Invoice created`,
        description: log.description || (metadata?.service as string) || null,
        timestamp: log.created_at,
        referenceId: log.reference_id || log.id,
        customerId: log.customer_id,
        customerName: null,
        href: `/employee-portal/invoices?invoiceId=${log.reference_id || log.id}`,
      })
    }
  }

  // 4. Deposit Paid
  if (depositPaidResult.data) {
    for (const invoice of depositPaidResult.data) {
      const customerArr = invoice.customer as { id: string; full_name: string }[] | null
      const customer = customerArr?.[0] ?? null
      notifications.push({
        id: `deposit_paid_${invoice.id}`,
        type: 'deposit_paid',
        title: `Deposit received${customer ? ` from ${customer.full_name}` : ''}`,
        description: invoice.service || null,
        timestamp: invoice.updated_at,
        referenceId: invoice.id,
        customerId: invoice.customer_id,
        customerName: customer?.full_name || null,
        href: `/employee-portal/invoices?invoiceId=${invoice.id}`,
      })
    }
  }

  // 5. New Leads
  if (newLeadsResult.data) {
    for (const lead of newLeadsResult.data) {
      notifications.push({
        id: `new_lead_${lead.id}`,
        type: 'new_lead',
        title: `New lead: ${lead.full_name}`,
        description: lead.service_type || lead.address || null,
        timestamp: lead.created_at,
        referenceId: lead.id,
        customerId: lead.customer_id,
        customerName: lead.full_name,
        href: `/employee-portal/leads?leadId=${lead.id}`,
      })
    }
  }

  // Sort all by timestamp descending
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json(notifications)
}
