'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function PortalHeader() {
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}/portal`} className="flex items-center">
            <Image
              src="/Topdeck Logo.avif"
              alt="Topdeck Montreal"
              width={150}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-sm text-secondary-600 hover:text-primary-500 transition-colors"
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
