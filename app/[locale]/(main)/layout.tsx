import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LocalBusinessJsonLd } from '@/components/seo/LocalBusinessJsonLd'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LocalBusinessJsonLd />
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  )
}
