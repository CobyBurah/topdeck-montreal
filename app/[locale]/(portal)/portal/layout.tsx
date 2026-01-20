import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSidebar } from '@/components/portal/PortalSidebar'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-secondary-50 min-h-screen">
      <PortalHeader />
      <PortalSidebar />
      <main className="pt-16 pl-64">
        {children}
      </main>
    </div>
  )
}
