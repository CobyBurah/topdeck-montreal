import { createClient } from '@/lib/supabase/server'
import { EstimatesTable } from '@/components/portal/EstimatesTable'
import type { Estimate } from '@/types/estimate'

export default async function EstimatesPage() {
  const supabase = await createClient()

  const { data: estimates, error } = await supabase
    .from('estimates')
    .select(`
      *,
      customer:customers (id, full_name, email, phone, language)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching estimates:', error)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Estimates
        </h1>
        <p className="text-secondary-600 mt-2">
          View and manage estimates sent through Square
        </p>
      </div>

      <EstimatesTable initialEstimates={(estimates as Estimate[]) || []} />
    </div>
  )
}
