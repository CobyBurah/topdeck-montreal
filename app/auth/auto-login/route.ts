import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(new URL('/en/client-portal/login', siteUrl))
  }

  const supabaseAdmin = getSupabaseAdmin()

  // Look up customer by permanent access_token
  const { data: customer, error: lookupError } = await supabaseAdmin
    .from('customers')
    .select('id, email, language, auth_user_id')
    .eq('access_token', token)
    .single()

  if (lookupError || !customer) {
    return NextResponse.redirect(new URL('/en/client-portal/login', siteUrl))
  }

  const locale = customer.language || 'en'

  if (!customer.email || !customer.auth_user_id) {
    return NextResponse.redirect(new URL(`/${locale}/client-portal/login`, siteUrl))
  }

  // Generate a fresh magic link server-side
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: customer.email,
    options: {
      redirectTo: `${siteUrl}/${locale}/client-portal`,
    },
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.redirect(new URL(`/${locale}/client-portal/login`, siteUrl))
  }

  // Create SSR client with cookies to establish session (mirrors /auth/callback pattern)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Immediately verify OTP to set session cookies
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  })

  if (verifyError) {
    return NextResponse.redirect(new URL(`/${locale}/client-portal/login`, siteUrl))
  }

  return NextResponse.redirect(new URL(`/${locale}/client-portal`, siteUrl))
}
