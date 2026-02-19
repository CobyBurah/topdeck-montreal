import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const response = intlMiddleware(request)

  // Check route types
  const isPortalRoute = request.nextUrl.pathname.match(/^\/(en|fr)\/employee-portal(?!\/login)/)
  const isPortalLoginPage = request.nextUrl.pathname.match(/^\/(en|fr)\/employee-portal\/login/)
  const isClientPortalRoute = request.nextUrl.pathname.match(/^\/(en|fr)\/client-portal(?!\/login)/)
  const isClientLoginPage = request.nextUrl.pathname.match(/^\/(en|fr)\/client-portal\/login/)

  // If not a protected route, just return the i18n response
  if (!isPortalRoute && !isPortalLoginPage && !isClientPortalRoute && !isClientLoginPage) {
    return response
  }

  // Create Supabase client for auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const locale = request.nextUrl.pathname.split('/')[1] || defaultLocale
  const userRole = user?.user_metadata?.role || 'employee'

  // --- Employee Portal Routes ---
  if (isPortalRoute) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/employee-portal/login`, request.url))
    }
    if (userRole === 'client') {
      return NextResponse.redirect(new URL(`/${locale}/client-portal`, request.url))
    }
    return response
  }

  // --- Employee Login Page ---
  if (isPortalLoginPage) {
    if (user && userRole !== 'client') {
      return NextResponse.redirect(new URL(`/${locale}/employee-portal`, request.url))
    }
    return response
  }

  // --- Client Portal Routes ---
  if (isClientPortalRoute) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/client-portal/login`, request.url))
    }
    if (userRole === 'employee') {
      return NextResponse.redirect(new URL(`/${locale}/employee-portal`, request.url))
    }
    return response
  }

  // --- Client Login Page ---
  if (isClientLoginPage) {
    if (user && userRole === 'client') {
      return NextResponse.redirect(new URL(`/${locale}/client-portal`, request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: ['/', '/(en|fr)/:path*', '/client-portal/:path*', '/employee-portal/:path*'],
}
