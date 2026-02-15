'use client'

import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { cn } from '@/lib/utils'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} version="beta">
    <div className="bg-secondary-50 min-h-screen">
      <PortalHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <PortalSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={cn('pt-16 pl-0 transition-all duration-300', isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64')}>
        {children}
      </main>
    </div>
    </APIProvider>
  )
}
