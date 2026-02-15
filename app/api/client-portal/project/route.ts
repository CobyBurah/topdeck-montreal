import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = user.user_metadata?.role
  if (userRole !== 'client') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Find the customer record linked to this auth user
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, address, language')
    .eq('auth_user_id', user.id)
    .single()

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Fetch related data in parallel
  const [leadsResult, estimatesResult, invoicesResult] = await Promise.all([
    supabase
      .from('leads')
      .select('id, created_at, service_type, status, condition, favourite_stains, stain_choices')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('estimates')
      .select('id, created_at, service, estimate_id, estimate_link')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id, created_at, service, price, status, invoice_link')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    customer,
    leads: leadsResult.data || [],
    estimates: estimatesResult.data || [],
    invoices: invoicesResult.data || [],
  })
}
