import { createClient } from '@/lib/supabase/server'
import { LeadsThreePanel } from '@/components/portal/LeadsThreePanel'
import type { Lead } from '@/types/lead'

interface LeadsPageProps {
  searchParams: Promise<{ leadId?: string }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { leadId } = await searchParams
  const supabase = await createClient()

  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
  }

  const leadsData = (leads as Lead[]) || []

  // Fetch last interactions for all linked customers
  const customerIds = Array.from(new Set(leadsData.map((l) => l.customer_id).filter(Boolean))) as string[]
  let lastInteractions: Record<string, string> = {}
  if (customerIds.length > 0) {
    const { data: interactions } = await supabase.rpc('get_last_interactions', {
      customer_ids: customerIds,
    })
    if (interactions) {
      lastInteractions = Object.fromEntries(
        interactions.map((i: { customer_id: string; last_interaction_at: string }) => [i.customer_id, i.last_interaction_at])
      )
    }
  }

  // Fetch unreplied customer IDs for blue dot indicators
  let unrepliedCustomerIds: string[] = []
  if (customerIds.length > 0) {
    const { data: unreplied } = await supabase.rpc('get_unreplied_customer_ids', {
      customer_ids: customerIds,
    })
    if (unreplied) {
      unrepliedCustomerIds = unreplied.map((r: { customer_id: string }) => r.customer_id)
    }
  }

  return (
    <LeadsThreePanel
      initialLeads={leadsData}
      lastInteractions={lastInteractions}
      initialUnrepliedCustomerIds={unrepliedCustomerIds}
      initialSelectedLeadId={leadId}
    />
  )
}
