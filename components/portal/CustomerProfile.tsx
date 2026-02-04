'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { LeadsTable } from './LeadsTable'
import { EstimatesTable } from './EstimatesTable'
import { InvoicesTable } from './InvoicesTable'
import { CommunicationTimeline } from './CommunicationTimeline'
import { MessageComposer } from './MessageComposer'
import { CustomerModal } from './CustomerModal'
import { CustomerMergeModal } from './CustomerMergeModal'
import { NewLeadModal } from './NewLeadModal'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { Button } from '@/components/ui/Button'
import { useCommunicationsRealtime } from '@/hooks/useCommunicationsRealtime'
import type { Customer } from '@/types/customer'
import type { Lead } from '@/types/lead'
import type { Estimate } from '@/types/estimate'
import type { Invoice } from '@/types/invoice'
import type { TimelineItem, TimelineItemType } from '@/types/communication'

interface CustomerProfileProps {
  customer: Customer
  leads: Lead[]
  estimates: Estimate[]
  invoices: Invoice[]
  timeline: TimelineItem[]
}

export function CustomerProfile({
  customer: initialCustomer,
  leads: initialLeads,
  estimates: initialEstimates,
  invoices: initialInvoices,
  timeline: initialTimeline
}: CustomerProfileProps) {
  const locale = useLocale()
  const router = useRouter()
  const [customer, setCustomer] = useState(initialCustomer)
  const [customerLeads, setCustomerLeads] = useState(initialLeads)
  const [customerEstimates, setCustomerEstimates] = useState(initialEstimates)
  const [customerInvoices, setCustomerInvoices] = useState(initialInvoices)
  const [timeline, setTimeline] = useState(initialTimeline)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [composerMode, setComposerMode] = useState<'email' | 'sms' | null>(null)
  const [replyContext, setReplyContext] = useState<{ emailId: string; subject: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'leads' | 'estimates' | 'invoices' | 'communication'>('leads')

  // Memoize realtime callbacks for communications
  const handleTimelineInsert = useCallback((newItem: TimelineItem) => {
    setTimeline((prev) => {
      // Insert in sorted position (most recent first)
      const newItems = [...prev]
      const insertIndex = newItems.findIndex(
        (item) => new Date(item.timestamp) < new Date(newItem.timestamp)
      )
      if (insertIndex === -1) {
        newItems.push(newItem)
      } else {
        newItems.splice(insertIndex, 0, newItem)
      }
      return newItems
    })
  }, [])

  const handleTimelineUpdate = useCallback((updatedItem: TimelineItem) => {
    setTimeline((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id && item.type === updatedItem.type ? updatedItem : item
      )
    )
  }, [])

  const handleTimelineDelete = useCallback((itemId: string, type: TimelineItemType) => {
    setTimeline((prev) => prev.filter((item) => !(item.id === itemId && item.type === type)))
  }, [])

  // Set up realtime subscription for this customer's communications
  useCommunicationsRealtime({
    customerId: customer.id,
    onItemInsert: handleTimelineInsert,
    onItemUpdate: handleTimelineUpdate,
    onItemDelete: handleTimelineDelete,
  })

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer)
  }

  const handleLeadCreate = (newLead: Lead) => {
    setCustomerLeads((prev) => [newLead, ...prev])
  }

  const handleCustomerDelete = () => {
    router.push(`/${locale}/portal/customers`)
  }

  const handleMergeComplete = (mergedCustomer: Customer) => {
    router.push(`/${locale}/portal/customers/${mergedCustomer.id}`)
  }

  const handleReply = useCallback((emailId: string, subject: string, _customerId: string) => {
    setReplyContext({ emailId, subject })
    setComposerMode('email')
  }, [])

  const handleCloseComposer = useCallback(() => {
    setComposerMode(null)
    setReplyContext(null)
  }, [])


  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Back Link */}
      <Link
        href={`/${locale}/portal/customers`}
        className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-500 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-secondary-900">
                {customer.full_name}
              </h1>
              <LeadLanguageBadge language={customer.language} />
            </div>
            <div className="space-y-1 text-secondary-600">
              {customer.email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(customer.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.email}
                </a>
              )}
              {customer.phone && (
                <a href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`} className="flex items-center gap-2 hover:text-primary-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </a>
              )}
              {customer.address && (
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {customer.address}
                </p>
              )}
            </div>
            {customer.internal_notes && (
              <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                <p className="text-sm text-secondary-600">
                  <span className="font-medium">Notes:</span> {customer.internal_notes}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Quick contact buttons */}
            <div className="flex items-center gap-2 pr-3 border-r border-secondary-200">
              {customer.phone && (
                <a
                  href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Call customer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
              {customer.email && (
                <button
                  onClick={() => { setActiveTab('communication'); setComposerMode('email') }}
                  className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  title="Send email"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              {customer.phone && (
                <button
                  onClick={() => { setActiveTab('communication'); setComposerMode('sms') }}
                  className="p-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors"
                  title="Send text message"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
            </div>

            <Button variant="ghost" onClick={() => setIsMergeModalOpen(true)}>
              Merge
            </Button>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              Edit Customer
            </Button>
            <Button onClick={() => setIsNewLeadModalOpen(true)}>
              + New Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-secondary-200">
          <nav className="flex">
            {[
              { key: 'leads', label: 'Leads', count: customerLeads.length },
              { key: 'estimates', label: 'Estimates', count: customerEstimates.length },
              { key: 'invoices', label: 'Invoices', count: customerInvoices.length },
              { key: 'communication', label: 'Communication', count: timeline.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'leads' && (
            customerLeads.length > 0 ? (
              <LeadsTable initialLeads={customerLeads} showStatsCards={false} />
            ) : (
              <div className="py-12 text-center text-secondary-500">
                No leads found for this customer
              </div>
            )
          )}
          {activeTab === 'estimates' && (
            customerEstimates.length > 0 ? (
              <EstimatesTable initialEstimates={customerEstimates} />
            ) : (
              <div className="py-12 text-center text-secondary-500">
                No estimates found for this customer
              </div>
            )
          )}
          {activeTab === 'invoices' && (
            customerInvoices.length > 0 ? (
              <InvoicesTable initialInvoices={customerInvoices} />
            ) : (
              <div className="py-12 text-center text-secondary-500">
                No invoices found for this customer
              </div>
            )
          )}
          {activeTab === 'communication' && (
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setComposerMode('email')}
                  disabled={!customer.email || composerMode !== null}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setComposerMode('sms')}
                  disabled={!customer.phone || composerMode !== null}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Send Text Message
                </Button>
              </div>

              {/* Split view */}
              <div className="flex gap-6">
                <motion.div
                  layout
                  className={composerMode ? 'w-1/2' : 'w-full'}
                  transition={{ duration: 0.3 }}
                >
                  <CommunicationTimeline items={timeline} onReply={handleReply} />
                </motion.div>

                {composerMode && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '50%' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px]"
                  >
                    <MessageComposer
                      customer={customer}
                      mode={composerMode}
                      onClose={handleCloseComposer}
                      onSent={handleCloseComposer}
                      replyTo={replyContext || undefined}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      <CustomerModal
        customer={customer}
        isOpen={isEditModalOpen}
        isNew={false}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleCustomerUpdate}
        onCreate={() => {}}
        onDelete={handleCustomerDelete}
      />

      {/* New Lead Modal */}
      <NewLeadModal
        customer={customer}
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onCreate={handleLeadCreate}
      />

      {/* Merge Customer Modal */}
      <CustomerMergeModal
        sourceCustomer={customer}
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onMergeComplete={handleMergeComplete}
      />
    </div>
  )
}
