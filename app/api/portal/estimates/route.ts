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
      customer:customers (id, full_name, email, phone, language)
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
      estimate_id: body.estimate_id,
      estimate_link: body.estimate_link,
      service: body.service,
      price: body.price,
      internal_notes: body.internal_notes,
    })
    .select(`
      *,
      customer:customers (id, full_name, email, phone, language)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(estimate)
}
