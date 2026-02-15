import { createClient } from '@/lib/supabase/server'
import { EstimatesThreePanel } from '@/components/portal/EstimatesThreePanel'
import type { Estimate } from '@/types/estimate'

interface EstimatesPageProps {
  searchParams: Promise<{ estimateId?: string }>
}

export default async function EstimatesPage({ searchParams }: EstimatesPageProps) {
  const { estimateId } = await searchParams
  const supabase = await createClient()

  const { data: estimates, error } = await supabase
    .from('estimates')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
      lead:leads (*, lead_photos (*))
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching estimates:', error)
  }

  const estimatesData = (estimates as Estimate[]) || []

  // Fetch last interactions for all customers
  const customerIds = Array.from(new Set(estimatesData.map((e) => e.customer_id)))
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

  // Fetch unreplied customer IDs
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
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-3xl font-bold text-secondary-900">Estimates</h1>
        <p className="text-secondary-600 mt-1">View and manage estimates sent through Square</p>
      </div>

      <EstimatesThreePanel
        initialEstimates={estimatesData}
        lastInteractions={lastInteractions}
        initialUnrepliedCustomerIds={unrepliedCustomerIds}
        initialSelectedEstimateId={estimateId}
      />
    </div>
  )
}
