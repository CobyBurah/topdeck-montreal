'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { LeadsTable } from './LeadsTable'
import { CustomerModal } from './CustomerModal'
import { NewLeadModal } from './NewLeadModal'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types/customer'
import type { Lead } from '@/types/lead'

interface CustomerProfileProps {
  customer: Customer
  leads: Lead[]
}

export function CustomerProfile({ customer: initialCustomer, leads: initialLeads }: CustomerProfileProps) {
  const locale = useLocale()
  const [customer, setCustomer] = useState(initialCustomer)
  const [customerLeads, setCustomerLeads] = useState(initialLeads)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'leads' | 'estimates' | 'invoices'>('leads')

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer)
  }

  const handleLeadCreate = (newLead: Lead) => {
    setCustomerLeads((prev) => [newLead, ...prev])
  }

  // Filter leads by status for tabs
  const allLeads = customerLeads
  const estimates = customerLeads.filter((lead) => lead.status === 'quote_sent')
  const invoices = customerLeads.filter((lead) => lead.status === 'invoiced')

  const getTabLeads = () => {
    switch (activeTab) {
      case 'estimates':
        return estimates
      case 'invoices':
        return invoices
      default:
        return allLeads
    }
  }

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
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </p>
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
              { key: 'leads', label: 'Leads', count: allLeads.length },
              { key: 'estimates', label: 'Estimates', count: estimates.length },
              { key: 'invoices', label: 'Invoices', count: invoices.length },
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
          {getTabLeads().length > 0 ? (
            <LeadsTable initialLeads={getTabLeads()} />
          ) : (
            <div className="py-12 text-center text-secondary-500">
              No {activeTab} found for this customer
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
      />

      {/* New Lead Modal */}
      <NewLeadModal
        customer={customer}
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onCreate={handleLeadCreate}
      />
    </div>
  )
}
