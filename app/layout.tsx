import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Topdeck Montreal | Professional Deck Staining & Exterior Painting',
  description: 'Expert deck staining, fence staining, railing services, and pressure washing in Montreal. Protect and enhance your outdoor spaces with Topdeck Montreal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
