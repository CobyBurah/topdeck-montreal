import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: estimates, error } = await supabase
    .from('estimates')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
      lead:leads (*, lead_photos (*))
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(estimates)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data: estimate, error } = await supabase
    .from('estimates')
    .insert({
      customer_id: body.customer_id,
      lead_id: body.lead_id || null,
      estimate_id: body.estimate_id,
      estimate_link: body.estimate_link,
      service: body.service,
      price: body.price,
      internal_notes: body.internal_notes,
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
      .from('estimates')
      .update({ favourite_stains: customerLeads[0].favourite_stains })
      .eq('id', estimate.id)
  }

  // Create activity log entry (persists even if estimate is deleted)
  await supabase.from('activity_log').insert({
    customer_id: body.customer_id,
    event_type: 'estimate_created',
    reference_id: estimate.id,
    reference_type: 'estimate',
    title: 'Estimate Created',
    description: estimate.service || null,
    metadata: {
      estimateId: estimate.estimate_id,
      service: estimate.service,
      price: estimate.price,
    },
  })

  return NextResponse.json(estimate)
}
