import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustomerProfile } from '@/components/portal/CustomerProfile'
import type { Customer } from '@/types/customer'
import type { Lead } from '@/types/lead'

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

  return (
    <CustomerProfile
      customer={customer as Customer}
      leads={(leads as Lead[]) || []}
    />
  )
}
