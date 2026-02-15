import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = user.user_metadata?.role
  if (userRole !== 'client') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { stainId } = body as { stainId: string }

  if (!stainId || typeof stainId !== 'string') {
    return NextResponse.json({ error: 'Invalid stainId' }, { status: 400 })
  }

  // Find customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Fetch leads with a condition set
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, favourite_stains')
    .eq('customer_id', customer.id)
    .not('condition', 'is', null)

  if (leadsError || !leads || leads.length === 0) {
    return NextResponse.json({ error: 'No eligible leads found' }, { status: 404 })
  }

  // Use the first lead's favourites to determine toggle direction
  const currentFavourites: string[] = leads[0].favourite_stains || []
  const isFavourited = currentFavourites.includes(stainId)
  const newFavourites = isFavourited
    ? currentFavourites.filter((id: string) => id !== stainId)
    : [...currentFavourites, stainId]

  // Update all eligible leads with the same favourites
  for (const lead of leads) {
    const leadFavs: string[] = lead.favourite_stains || []
    const updatedFavs = isFavourited
      ? leadFavs.filter((id: string) => id !== stainId)
      : leadFavs.includes(stainId) ? leadFavs : [...leadFavs, stainId]

    await supabase
      .from('leads')
      .update({ favourite_stains: updatedFavs })
      .eq('id', lead.id)
  }

  return NextResponse.json({ favourites: newFavourites })
}
