import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Look up customer by email
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, full_name, email, language, access_token, auth_user_id')
      .eq('email', email)
      .single()

    // Always return success to prevent email enumeration
    if (!customer || !customer.access_token) {
      return NextResponse.json({ success: true })
    }

    // Build permanent auto-login link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const loginLink = `${siteUrl}/auth/auto-login?token=${customer.access_token}`

    // Send webhook to n8n
    const webhookUrl = process.env.N8N_CLIENT_LOGIN_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customer.email,
          customer_name: customer.full_name,
          language: customer.language || 'en',
          login_link: loginLink,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client login request error:', error)
    return NextResponse.json({ success: true })
  }
}
