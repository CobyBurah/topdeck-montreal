import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
      lead:leads (*, lead_photos (*))
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      customer_id: body.customer_id,
      lead_id: body.lead_id,
      invoice_id: body.invoice_id,
      invoice_link: body.invoice_link,
      service: body.service,
      price: body.price,
      status: body.status || 'unpaid',
      internal_notes: body.internal_notes,
      estimate_id: body.estimate_id,
    })
    .select(`
      *,
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
      lead:leads (*, lead_photos (*))
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Copy favourite stains from customer's leads
  const { data: customerLeads } = await supabase
    .from('leads')
    .select('favourite_stains')
    .eq('customer_id', body.customer_id)
    .not('favourite_stains', 'eq', '{}')
    .limit(1)

  if (customerLeads?.[0]?.favourite_stains?.length) {
    await supabase
      .from('invoices')
      .update({ favourite_stains: customerLeads[0].favourite_stains })
      .eq('id', invoice.id)
  }

  // Create activity log entry (persists even if invoice is deleted)
  await supabase.from('activity_log').insert({
    customer_id: body.customer_id,
    event_type: 'invoice_created',
    reference_id: invoice.id,
    reference_type: 'invoice',
    title: 'Invoice Created',
    description: invoice.service || null,
    metadata: {
      invoiceId: invoice.invoice_id,
      service: invoice.service,
      price: invoice.price,
      invoiceStatus: invoice.status,
    },
  })

  return NextResponse.json(invoice)
}
