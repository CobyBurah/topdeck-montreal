import { createClient } from '@/lib/supabase/server'
import { InvoicesTable } from '@/components/portal/InvoicesTable'
import type { Invoice } from '@/types/invoice'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, language)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Invoices
        </h1>
        <p className="text-secondary-600 mt-2">
          View and manage invoices sent through Square
        </p>
      </div>

      <InvoicesTable initialInvoices={(invoices as Invoice[]) || []} />
    </div>
  )
}
