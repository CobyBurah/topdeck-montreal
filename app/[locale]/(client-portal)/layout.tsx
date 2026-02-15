import { ClientPortalHeader } from '@/components/client-portal/ClientPortalHeader'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-primary-50/30">
      <ClientPortalHeader />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
