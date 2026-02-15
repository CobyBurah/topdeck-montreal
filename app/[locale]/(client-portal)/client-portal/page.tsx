'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ProgressTracker } from '@/components/client-portal/ProgressTracker'
import { ProjectDetails } from '@/components/client-portal/ProjectDetails'
import { LoadingSkeleton } from '@/components/client-portal/LoadingSkeleton'
import { StainSection } from '@/components/client-portal/stain-selector/StainSection'
import type { LeadCondition } from '@/types/lead'

interface ProjectData {
  customer: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    address: string | null
    language: string
  }
  leads: Array<{
    id: string
    created_at: string
    service_type: string | null
    status: string
    condition: LeadCondition | null
    favourite_stains: string[] | null
    stain_choices: string[] | null
  }>
  estimates: Array<{
    id: string
    created_at: string
    service: string | null
    estimate_id: string | null
    estimate_link: string | null
  }>
  invoices: Array<{
    id: string
    created_at: string
    service: string | null
    price: number | null
    status: string
    invoice_link: string | null
  }>
}

export default function ClientPortalPage() {
  const t = useTranslations('clientPortal')
  const [data, setData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/client-portal/project')
        if (!response.ok) throw new Error('Failed to fetch')
        const projectData = await response.json()
        setData(projectData)
      } catch {
        setError(t('error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-secondary-600">{error || t('error')}</p>
        </div>
      </div>
    )
  }

  const hasLead = data.leads.length > 0
  const hasEstimate = data.estimates.length > 0
  const hasInvoice = data.invoices.length > 0

  const steps = [
    { key: 'requestReceived', completed: hasLead },
    { key: 'estimateSent', completed: hasEstimate },
    { key: 'invoiceCreated', completed: hasInvoice },
  ]

  const firstName = data.customer.full_name.split(' ')[0]

  const firstEstimate = data.estimates[0]
  const estimateLink = firstEstimate?.estimate_id
    ? `https://app.squareup.com/pay-invoice/estimate/${firstEstimate.estimate_id}`
    : firstEstimate?.estimate_link ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          {t('greeting', { name: firstName })}
        </h1>
        <p className="text-secondary-600 mt-2">{t('subtitle')}</p>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker steps={steps} estimateLink={estimateLink} />

      {/* Detail Cards */}
      <ProjectDetails
        invoices={data.invoices}
      />

      {/* Stain Selector */}
      <StainSection
        conditions={data.leads.map((l) => l.condition)}
        stainChoices={Array.from(new Set(data.leads.flatMap((l) => l.stain_choices || [])))}
        initialFavourites={
          Array.from(new Set(data.leads.flatMap((l) => l.favourite_stains || [])))
        }
      />
    </motion.div>
  )
}
