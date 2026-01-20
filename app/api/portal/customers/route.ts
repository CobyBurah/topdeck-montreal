import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      *,
      leads(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to include lead_count
  const customersWithCount = customers.map((customer) => ({
    ...customer,
    lead_count: customer.leads?.[0]?.count ?? 0,
  }))

  return NextResponse.json(customersWithCount)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      full_name: body.full_name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      language: body.language || 'en',
      internal_notes: body.internal_notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(customer)
}
