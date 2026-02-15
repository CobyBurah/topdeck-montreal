import { createClient } from '@/lib/supabase/server'
import { MapView } from '@/components/portal/MapView'
import type { Lead } from '@/types/lead'
import type { Estimate } from '@/types/estimate'
import type { Invoice } from '@/types/invoice'

const LEAD_SELECT = `
  *,
  lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
`

const ESTIMATE_SELECT = `
  *,
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
  lead:leads (*, lead_photos (*))
`

const INVOICE_SELECT = `
  *,
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
  lead:leads (*, lead_photos (*))
`

export default async function MapPage() {
  const supabase = await createClient()

  const [leadsResult, estimatesResult, invoicesResult] = await Promise.all([
    supabase
      .from('leads')
      .select(LEAD_SELECT)
      .not('status', 'in', '("estimate_sent","complete")')
      .order('created_at', { ascending: false }),
    supabase
      .from('estimates')
      .select(ESTIMATE_SELECT)
      .eq('status', 'sent')
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .in('status', ['unpaid', 'deposit_paid'])
      .order('created_at', { ascending: false }),
  ])

  if (leadsResult.error) console.error('Error fetching leads for map:', leadsResult.error)
  if (estimatesResult.error) console.error('Error fetching estimates for map:', estimatesResult.error)
  if (invoicesResult.error) console.error('Error fetching invoices for map:', invoicesResult.error)

  return (
    <MapView
      initialLeads={(leadsResult.data as Lead[]) || []}
      initialEstimates={(estimatesResult.data as Estimate[]) || []}
      initialInvoices={(invoicesResult.data as Invoice[]) || []}
    />
  )
}
