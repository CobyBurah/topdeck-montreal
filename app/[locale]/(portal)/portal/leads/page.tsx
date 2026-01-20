import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/portal/LeadsTable'
import type { Lead } from '@/types/lead'

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Leads
        </h1>
        <p className="text-secondary-600 mt-2">
          Manage and track all your leads from website inquiries
        </p>
      </div>

      <LeadsTable initialLeads={(leads as Lead[]) || []} />
    </div>
  )
}
