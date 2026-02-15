import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface PortalHomePageProps {
  params: Promise<{ locale: string }>
}

export default async function PortalHomePage({ params }: PortalHomePageProps) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch all leads to count by status
  const { data: leads } = await supabase
    .from('leads')
    .select('status')

  const allLeads = leads || []

  // Calculate counts by status
  const newCount = allLeads.filter((l) => l.status === 'new').length
  const needsDetailsCount = allLeads.filter((l) => l.status === 'needs_more_details').length
  const contactedCount = allLeads.filter((l) => l.status === 'contacted').length
  const quoteSentCount = allLeads.filter((l) => l.status === 'quote_sent').length
  const invoicedCount = allLeads.filter((l) => l.status === 'invoiced').length
  const completeCount = allLeads.filter((l) => l.status === 'complete').length

  // Card totals
  const leadsTotal = newCount + needsDetailsCount + contactedCount
  const estimatesTotal = quoteSentCount
  const invoicedTotal = invoicedCount
  const completedTotal = completeCount

  // Format current date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get time-based greeting
  const hour = today.getHours()
  let greeting = 'Good morning'
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon'
  } else if (hour >= 17) {
    greeting = 'Good evening'
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Greeting Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-secondary-900">
          {greeting}
        </h1>
        <p className="text-secondary-600 mt-2 text-lg">
          {formattedDate}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-6 lg:grid-cols-4">
        {/* Leads Card */}
        <Link
          href={`/${locale}/employee-portal/leads`}
          className="bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <svg className="hidden md:block w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-secondary-600 text-xs md:text-sm font-medium mb-1">Active Leads</h3>
          <p className="text-2xl md:text-4xl font-bold text-secondary-900 mb-1 md:mb-3">{leadsTotal}</p>
          <div className="space-y-1 text-xs md:text-sm text-secondary-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{newCount} New</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span>{needsDetailsCount} Needs Details</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>{contactedCount} Contacted</span>
            </div>
          </div>
        </Link>

        {/* Estimates Card */}
        <Link
          href={`/${locale}/employee-portal/estimates`}
          className="bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg className="hidden md:block w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-secondary-600 text-xs md:text-sm font-medium mb-1">Pending Estimates</h3>
          <p className="text-2xl md:text-4xl font-bold text-secondary-900 mb-1 md:mb-3">{estimatesTotal}</p>
          <div className="text-xs md:text-sm text-secondary-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>$0 total value</span>
            </div>
          </div>
        </Link>

        {/* Invoiced Card */}
        <Link
          href={`/${locale}/employee-portal/invoices`}
          className="bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="hidden md:block w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-secondary-600 text-xs md:text-sm font-medium mb-1">Invoiced Jobs</h3>
          <p className="text-2xl md:text-4xl font-bold text-secondary-900 mb-1 md:mb-3">{invoicedTotal}</p>
          <div className="space-y-1 text-xs md:text-sm text-secondary-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>0 deposit paid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>0 deposit pending</span>
            </div>
          </div>
        </Link>

        {/* Completed Card */}
        <Link
          href={`/${locale}/employee-portal/leads?status=complete`}
          className="bg-white rounded-xl shadow-lg p-3 md:p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="hidden md:block w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-secondary-600 text-xs md:text-sm font-medium mb-1">Completed Jobs</h3>
          <p className="text-2xl md:text-4xl font-bold text-secondary-900 mb-1 md:mb-3">{completedTotal}</p>
          <div className="text-xs md:text-sm text-secondary-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-400"></span>
              <span>All time</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
