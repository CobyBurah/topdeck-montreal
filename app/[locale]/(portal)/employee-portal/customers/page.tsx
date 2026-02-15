import { createClient } from '@/lib/supabase/server'
import { CustomersThreePanel } from '@/components/portal/CustomersThreePanel'
import type { Customer } from '@/types/customer'

interface CustomersPageProps {
  searchParams: Promise<{ customerId?: string }>
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { customerId } = await searchParams
  const supabase = await createClient()

  // Fetch customers with lead count
  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      *,
      leads(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
  }

  // Transform the data to include lead_count
  const customersWithCount = (customers || []).map((customer) => ({
    ...customer,
    lead_count: customer.leads?.[0]?.count ?? 0,
  })) as Customer[]

  // Fetch last interactions for all customers
  const customerIds = customersWithCount.map((c) => c.id)
  let lastInteractions: Record<string, string> = {}
  if (customerIds.length > 0) {
    const { data: interactions } = await supabase.rpc('get_last_interactions', {
      customer_ids: customerIds,
    })
    if (interactions) {
      lastInteractions = Object.fromEntries(
        interactions.map((i: { customer_id: string; last_interaction_at: string }) => [i.customer_id, i.last_interaction_at])
      )
      customersWithCount.forEach((customer) => {
        customer.last_interaction_at = lastInteractions[customer.id] || null
      })
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
    <CustomersThreePanel
      initialCustomers={customersWithCount}
      lastInteractions={lastInteractions}
      initialUnrepliedCustomerIds={unrepliedCustomerIds}
      initialSelectedCustomerId={customerId}
    />
  )
}
