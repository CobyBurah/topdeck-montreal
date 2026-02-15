import { createClient } from '@/lib/supabase/server'
import { InvoicesThreePanel } from '@/components/portal/InvoicesThreePanel'
import type { Invoice } from '@/types/invoice'

interface InvoicesPageProps {
  searchParams: Promise<{ invoiceId?: string }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { invoiceId } = await searchParams
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
      lead:leads (*, lead_photos (*))
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
  }

  const invoicesData = (invoices as Invoice[]) || []

  // Fetch last interactions for all customers
  const customerIds = Array.from(new Set(invoicesData.map((i) => i.customer_id)))
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
        <h1 className="text-3xl font-bold text-secondary-900">Invoices</h1>
        <p className="text-secondary-600 mt-1">View and manage invoices sent through Square</p>
      </div>

      <InvoicesThreePanel
        initialInvoices={invoicesData}
        lastInteractions={lastInteractions}
        initialUnrepliedCustomerIds={unrepliedCustomerIds}
        initialSelectedInvoiceId={invoiceId}
      />
    </div>
  )
}
