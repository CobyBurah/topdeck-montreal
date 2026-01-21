'use client'

import { useState } from 'react'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSidebar } from '@/components/portal/PortalSidebar'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="bg-secondary-50 min-h-screen">
      <PortalHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <PortalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 pl-0 md:pl-64">
        {children}
      </main>
    </div>
  )
}
