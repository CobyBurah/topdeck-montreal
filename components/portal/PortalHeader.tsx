'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface PortalHeaderProps {
  onMenuToggle: () => void
}

export function PortalHeader({ onMenuToggle }: PortalHeaderProps) {
  const locale = useLocale()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/portal/login`)
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger menu button - mobile only */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 -ml-2 mr-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href={`/${locale}/portal`} className="flex items-center">
              <Image
                src="/Topdeck Logo.avif"
                alt="Topdeck Montreal"
                width={150}
                height={56}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href={`/${locale}`}
              className="hidden md:block text-sm text-secondary-600 hover:text-primary-500 transition-colors"
            >
              View Website
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
