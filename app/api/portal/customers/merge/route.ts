import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sourceCustomerId, targetCustomerId } = await request.json()

  if (!sourceCustomerId || !targetCustomerId) {
    return NextResponse.json({ error: 'Both source and target customer IDs required' }, { status: 400 })
  }

  if (sourceCustomerId === targetCustomerId) {
    return NextResponse.json({ error: 'Cannot merge customer with itself' }, { status: 400 })
  }

  // Fetch both customers
  const [sourceResult, targetResult] = await Promise.all([
    supabase.from('customers').select('*').eq('id', sourceCustomerId).single(),
    supabase.from('customers').select('*').eq('id', targetCustomerId).single()
  ])

  if (sourceResult.error || !sourceResult.data) {
    return NextResponse.json({ error: 'Source customer not found' }, { status: 404 })
  }

  if (targetResult.error || !targetResult.data) {
    return NextResponse.json({ error: 'Target customer not found' }, { status: 404 })
  }

  const source = sourceResult.data
  const target = targetResult.data

  // Transfer all related records (ORDER MATTERS - must happen BEFORE delete)
  const transferredCounts = {
    leads: 0,
    estimates: 0,
    invoices: 0,
    emails: 0,
    sms: 0,
    calls: 0,
    activities: 0
  }

  // Transfer leads
  const leadsResult = await supabase
    .from('leads')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.leads = leadsResult.data?.length ?? 0

  // Transfer estimates
  const estimatesResult = await supabase
    .from('estimates')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.estimates = estimatesResult.data?.length ?? 0

  // Transfer invoices
  const invoicesResult = await supabase
    .from('invoices')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.invoices = invoicesResult.data?.length ?? 0

  // Transfer email_logs
  const emailsResult = await supabase
    .from('email_logs')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.emails = emailsResult.data?.length ?? 0

  // Transfer sms_logs
  const smsResult = await supabase
    .from('sms_logs')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.sms = smsResult.data?.length ?? 0

  // Transfer call_logs
  const callsResult = await supabase
    .from('call_logs')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.calls = callsResult.data?.length ?? 0

  // Transfer activity_log
  const activitiesResult = await supabase
    .from('activity_log')
    .update({ customer_id: targetCustomerId })
    .eq('customer_id', sourceCustomerId)
    .select()
  transferredCounts.activities = activitiesResult.data?.length ?? 0

  // Merge customer fields (target takes priority, source fills blanks)
  // For internal_notes, concatenate if both have values
  let mergedNotes = target.internal_notes
  if (source.internal_notes) {
    if (target.internal_notes) {
      mergedNotes = `${target.internal_notes}\n\n--- Merged from ${source.full_name} ---\n${source.internal_notes}`
    } else {
      mergedNotes = source.internal_notes
    }
  }

  const mergedFields = {
    full_name: target.full_name || source.full_name,
    email: target.email || source.email,
    phone: target.phone || source.phone,
    address: target.address || source.address,
    language: target.language || source.language,
    internal_notes: mergedNotes
  }

  // Update target customer with merged fields
  const { data: mergedCustomer, error: updateError } = await supabase
    .from('customers')
    .update(mergedFields)
    .eq('id', targetCustomerId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({
      error: 'Failed to update target customer',
      details: updateError.message
    }, { status: 500 })
  }

  // Delete source customer (now safe - all FKs transferred)
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .eq('id', sourceCustomerId)

  if (deleteError) {
    return NextResponse.json({
      error: 'Failed to delete source customer',
      details: deleteError.message
    }, { status: 500 })
  }

  // Log the merge as an activity on the target customer
  await supabase.from('activity_log').insert({
    customer_id: targetCustomerId,
    event_type: 'note_added',
    title: 'Customer Merged',
    description: `Merged with customer "${source.full_name}" (${source.email || source.phone || 'no contact info'})`,
    metadata: {
      merged_from_id: sourceCustomerId,
      merged_from_name: source.full_name,
      transferred_counts: transferredCounts
    }
  })

  return NextResponse.json({
    success: true,
    mergedCustomer,
    transferredCounts
  })
}
