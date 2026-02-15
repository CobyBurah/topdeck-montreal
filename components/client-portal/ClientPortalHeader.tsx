'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function ClientPortalHeader() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('clientPortal')

  if (pathname.endsWith('/login')) return null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/client-portal/login`)
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-secondary-200">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Image
            src="/Topdeck Logo.avif"
            alt="Topdeck Montreal"
            width={150}
            height={56}
            className="h-10 md:h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-3">
            <Button
              href={`/${locale}`}
              variant="primary"
              size="sm"
            >
              {t('backToWebsite')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
