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
    let accessToken: string | null = null

    // First, try to find by email
    if (email) {
      const { data: existingByEmail } = await supabaseAdmin
        .from('customers')
        .select('id, access_token')
        .eq('email', email)
        .single()

      if (existingByEmail) {
        customerId = existingByEmail.id
        accessToken = existingByEmail.access_token
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
        .select('id, access_token')
        .eq('phone', phone)
        .single()

      if (existingByPhone) {
        customerId = existingByPhone.id
        accessToken = existingByPhone.access_token
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
        .select('id, access_token')
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        // Continue without customer link if creation fails
      } else {
        customerId = newCustomer.id
        accessToken = newCustomer.access_token
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

    // --- Client Portal: Create auth user + build permanent portal link ---
    let clientPortalLink: string | null = null

    if (email && customerId) {
      try {
        // Check if customer already has an auth user linked
        const { data: customerRecord } = await supabaseAdmin
          .from('customers')
          .select('auth_user_id')
          .eq('id', customerId)
          .single()

        let authUserId = customerRecord?.auth_user_id

        if (!authUserId) {
          // Check if a Supabase auth user with this email already exists
          const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
          const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email)

          if (existingAuthUser) {
            authUserId = existingAuthUser.id
            // Ensure client role is set
            if (existingAuthUser.user_metadata?.role !== 'client') {
              await supabaseAdmin.auth.admin.updateUserById(authUserId, {
                user_metadata: { ...existingAuthUser.user_metadata, role: 'client', customer_id: customerId },
              })
            }
          } else {
            // Create new auth user for client portal access
            const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { role: 'client', customer_id: customerId },
            })

            if (createUserError) {
              console.error('Error creating auth user for client:', createUserError)
            } else {
              authUserId = newUser.user.id
            }
          }

          // Link auth user to customer record
          if (authUserId) {
            await supabaseAdmin
              .from('customers')
              .update({ auth_user_id: authUserId })
              .eq('id', customerId)
          }
        }

        // Build permanent portal link using the customer's access_token
        if (accessToken) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          clientPortalLink = `${siteUrl}/auth/auto-login?token=${accessToken}`
        }
      } catch (authError) {
        console.error('Client portal auth error:', authError)
      }
    }

    // Handle image uploads
    const images = formData.getAll('images') as File[]
    const uploadedPhotoPaths: string[] = []
    console.log(`Received ${images.length} image(s) for lead ${lead.id}`)

    for (const image of images) {
      if (image.size > 0) {
        const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${lead.id}/${Date.now()}-${safeName}`

        // Convert File to Buffer for Node.js compatibility with Supabase Storage
        const arrayBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('lead-photos')
          .upload(fileName, buffer, {
            contentType: image.type,
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue
        }

        uploadedPhotoPaths.push(fileName)

        // Create photo record
        const { error: insertError } = await supabaseAdmin.from('lead_photos').insert({
          lead_id: lead.id,
          storage_path: fileName,
          original_filename: image.name,
          file_size: image.size,
          mime_type: image.type,
        })

        if (insertError) {
          console.error('Error creating photo record:', insertError)
        }
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
            client_portal_link: clientPortalLink,
          }),
        })
      } catch (webhookError) {
        // Log but don't fail the request if webhook fails
        console.error('n8n webhook error:', webhookError)
      }
    }

    console.log('New lead created:', lead.id)

    return NextResponse.json({ success: true, leadId: lead.id, clientPortalLink })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
