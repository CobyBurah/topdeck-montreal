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

  // Check if this is a portal route
  const isPortalRoute = request.nextUrl.pathname.match(/^\/(en|fr)\/portal(?!\/login)/)
  const isLoginPage = request.nextUrl.pathname.match(/^\/(en|fr)\/portal\/login/)

  // If not a portal route, just return the i18n response
  if (!isPortalRoute && !isLoginPage) {
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

  // Extract locale from path
  const locale = request.nextUrl.pathname.split('/')[1] || defaultLocale

  // If accessing portal (not login) without auth, redirect to login
  if (isPortalRoute && !user) {
    return NextResponse.redirect(new URL(`/${locale}/portal/login`, request.url))
  }

  // If on login page with auth, redirect to portal
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL(`/${locale}/portal`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/(en|fr)/:path*'],
}
