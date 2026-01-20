import { createClient } from '@/lib/supabase/server'
import { CustomersTable } from '@/components/portal/CustomersTable'
import type { Customer } from '@/types/customer'

export default async function CustomersPage() {
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Customers
        </h1>
        <p className="text-secondary-600 mt-2">
          View and manage your customers
        </p>
      </div>

      <CustomersTable initialCustomers={customersWithCount} />
    </div>
  )
}
