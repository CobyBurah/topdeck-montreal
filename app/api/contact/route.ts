import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const formData = await request.formData()

    const language = (formData.get('language') as string) || 'en'
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const fullName = formData.get('name') as string
    const address = (formData.get('address') as string) || null

    // Find or create customer by email or phone
    let customerId: string | null = null

    // First, try to find by email
    if (email) {
      const { data: existingByEmail } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', email)
        .single()

      if (existingByEmail) {
        customerId = existingByEmail.id
        // Update customer info if we have new data
        await supabaseAdmin
          .from('customers')
          .update({
            full_name: fullName,
            phone: phone || undefined,
            address: address || undefined,
            language: language as 'en' | 'fr',
          })
          .eq('id', customerId)
      }
    }

    // If not found by email and phone provided, try to find by phone
    if (!customerId && phone) {
      const { data: existingByPhone } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .single()

      if (existingByPhone) {
        customerId = existingByPhone.id
        // Update customer info if we have new data
        await supabaseAdmin
          .from('customers')
          .update({
            full_name: fullName,
            email: email || undefined,
            address: address || undefined,
            language: language as 'en' | 'fr',
          })
          .eq('id', customerId)
      }
    }

    // If no existing customer found, create a new one
    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          full_name: fullName,
          email: email || null,
          phone: phone,
          address: address,
          language: language as 'en' | 'fr',
        })
        .select('id')
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        // Continue without customer link if creation fails
      } else {
        customerId = newCustomer.id
      }
    }

    const leadData = {
      full_name: fullName,
      email: email,
      phone: phone,
      address: address,
      service_type: (formData.get('service') as string) || null,
      approximate_size: (formData.get('size') as string) || null,
      preferred_timeline: (formData.get('timeline') as string) || null,
      additional_details: (formData.get('message') as string) || null,
      source: 'form' as const,
      status: 'new' as const,
      language: language as 'en' | 'fr',
      customer_id: customerId,
    }

    // Insert lead into database
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('Error inserting lead:', leadError)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    // Create activity log entry for the lead (persists even if lead is deleted)
    if (customerId) {
      await supabaseAdmin.from('activity_log').insert({
        customer_id: customerId,
        event_type: 'lead_created',
        reference_id: lead.id,
        reference_type: 'lead',
        title: 'Lead Created',
        description: leadData.service_type ? `Service: ${leadData.service_type}` : null,
        metadata: {
          leadId: lead.id,
          service: leadData.service_type,
          leadSource: leadData.source,
        },
      })
    }

    // Handle image uploads
    const images = formData.getAll('images') as File[]
    const uploadedPhotoPaths: string[] = []

    for (const image of images) {
      if (image.size > 0) {
        const fileName = `${lead.id}/${Date.now()}-${image.name}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await image.arrayBuffer()

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('lead-photos')
          .upload(fileName, arrayBuffer, {
            contentType: image.type,
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue
        }

        uploadedPhotoPaths.push(fileName)

        // Create photo record
        await supabaseAdmin.from('lead_photos').insert({
          lead_id: lead.id,
          storage_path: fileName,
          original_filename: image.name,
          file_size: image.size,
          mime_type: image.type,
        })
      }
    }

    // Send webhook to n8n for automations (emails, OpenPhone, Square)
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl) {
      try {
        // Get public URLs for uploaded photos
        const photoUrls = uploadedPhotoPaths.map((path) => {
          const { data } = supabaseAdmin.storage.from('lead-photos').getPublicUrl(path)
          return data.publicUrl
        })

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: lead.id,
            full_name: leadData.full_name,
            email: leadData.email,
            phone: leadData.phone,
            address: leadData.address,
            service_type: leadData.service_type,
            approximate_size: leadData.approximate_size,
            preferred_timeline: leadData.preferred_timeline,
            additional_details: leadData.additional_details,
            language: leadData.language,
            photo_urls: photoUrls,
            photo_count: photoUrls.length,
            created_at: lead.created_at,
          }),
        })
      } catch (webhookError) {
        // Log but don't fail the request if webhook fails
        console.error('n8n webhook error:', webhookError)
      }
    }

    console.log('New lead created:', lead.id)

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
