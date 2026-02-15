'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { CustomerMergeModal } from './CustomerMergeModal'
import { NewLeadModal } from './NewLeadModal'
import { LEAD_LANGUAGES, type LeadLanguage, type Lead, type LeadStatus } from '@/types/lead'
import type { Customer } from '@/types/customer'
import type { Estimate } from '@/types/estimate'
import type { Invoice, InvoiceStatus } from '@/types/invoice'

interface CustomerDetailPanelProps {
  customer: Customer
  onUpdate: (customer: Customer) => void
  onDelete?: (customerId: string) => void
  onBack?: () => void
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  needs_more_details: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-purple-100 text-purple-700',
  quote_sent: 'bg-orange-100 text-orange-700',
  estimate_sent: 'bg-teal-100 text-teal-700',
  invoiced: 'bg-cyan-100 text-cyan-700',
  booked: 'bg-green-100 text-green-700',
  complete: 'bg-secondary-100 text-secondary-700',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  needs_more_details: 'Needs Details',
  contacted: 'Contacted',
  quote_sent: 'Quote Sent',
  estimate_sent: 'Estimate Sent',
  invoiced: 'Invoiced',
  booked: 'Booked',
  complete: 'Complete',
}

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  unpaid: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-blue-100 text-blue-700',
  fully_paid: 'bg-green-100 text-green-700',
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
}

export function CustomerDetailPanel({ customer, onUpdate, onDelete, onBack }: CustomerDetailPanelProps) {
  const locale = useLocale()
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [copiedPortalLink, setCopiedPortalLink] = useState(false)

  // Related data (fetched client-side)
  const [leads, setLeads] = useState<Lead[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(false)

  useEffect(() => {
    setFormData(customer)
    setIsEditing(false)
    setError(null)
    setEmailError(null)
    setShowDeleteConfirm(false)
  }, [customer])

  // Fetch related data when customer changes
  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsLoadingRelated(true)
      const supabase = createClient()

      const [leadsResult, estimatesResult, invoicesResult] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('estimates')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false }),
      ])

      setLeads((leadsResult.data as Lead[]) || [])
      setEstimates((estimatesResult.data as Estimate[]) || [])
      setInvoices((invoicesResult.data as Invoice[]) || [])
      setIsLoadingRelated(false)
    }

    fetchRelatedData()
  }, [customer.id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'email' && emailError) {
      setEmailError(null)
    }
  }

  const handleEmailBlur = () => {
    const email = formData.email || ''
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address')
    }
  }

  const handleCancelEdit = () => {
    setFormData(customer)
    setIsEditing(false)
    setError(null)
    setEmailError(null)
  }

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      setError('Full name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('customers')
      .update({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        language: (formData.language as LeadLanguage) || 'en',
        internal_notes: formData.internal_notes || null,
      })
      .eq('id', customer.id)
      .select()
      .single()

    setIsSaving(false)

    if (updateError) {
      setError('Failed to save changes. Please try again.')
      console.error('Error updating customer:', updateError)
      return
    }

    // Sync denormalized contact fields on all linked leads
    await supabase
      .from('leads')
      .update({
        full_name: formData.full_name,
        email: formData.email || '',
        phone: formData.phone || null,
        address: formData.address || null,
      })
      .eq('customer_id', customer.id)

    onUpdate(data as Customer)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id)

    setIsDeleting(false)

    if (deleteError) {
      setError('Failed to delete customer. Please try again.')
      console.error('Error deleting customer:', deleteError)
      return
    }

    onDelete(customer.id)
    setShowDeleteConfirm(false)
  }

  const handleMergeComplete = (mergedCustomer: Customer) => {
    setIsMergeModalOpen(false)
    onUpdate(mergedCustomer)
  }

  const handleLeadCreate = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '—'
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)
  }

  const activeLeads = leads.filter((l) => l.status !== 'complete')
  const estimatesTotal = estimates.reduce((sum, e) => sum + (e.price || 0), 0)
  const invoicesTotal = invoices.reduce((sum, i) => sum + (i.price || 0), 0)

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* Header: Name + Contact Links */}
        <div className="px-6 py-5 border-b border-secondary-200 shrink-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              {/* Mobile back button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors lg:hidden mb-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <h1 className="text-2xl font-bold text-secondary-900 truncate">
                {formData.full_name}
              </h1>

              {/* Clickable contact links */}
              <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                {formData.phone && (
                  <a
                    href={`openphone://dial?number=${encodeURIComponent(formData.phone)}&action=call`}
                    className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {formData.phone}
                  </a>
                )}
                {formData.email && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(formData.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    <EmailIcon className="w-4 h-4" />
                    {formData.email}
                  </a>
                )}
                {formData.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(formData.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4" />
                    {formData.address}
                  </a>
                )}
              </div>

              {/* Language badge */}
              <div className="flex items-center gap-2 mt-2">
                <LeadLanguageBadge language={customer.language} />
              </div>
            </div>

            {/* Edit button */}
            <div className="flex items-center gap-2 shrink-0">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 hover:text-secondary-900"
                  title="Edit customer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-secondary-200 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Lead
            </button>
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-600 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Merge
            </button>

            {customer.access_token && (
              <button
                onClick={() => {
                  const link = `${window.location.origin}/auth/auto-login?token=${customer.access_token}`
                  navigator.clipboard.writeText(link)
                  setCopiedPortalLink(true)
                  setTimeout(() => setCopiedPortalLink(false), 2000)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-600 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                {copiedPortalLink ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Portal Link
                  </>
                )}
              </button>
            )}

            <div className="w-px h-6 bg-secondary-200 mx-1" />

            <span className="text-xs text-secondary-500">
              Created {formatDate(customer.created_at)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Edit mode: contact info form */}
          {isEditing && (
            <section>
              <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Contact Information</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  error={emailError || undefined}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
                <Select
                  label="Language"
                  name="language"
                  value={formData.language || 'en'}
                  onChange={handleChange}
                  options={LEAD_LANGUAGES}
                />
                <Textarea
                  label="Internal Notes"
                  name="internal_notes"
                  value={formData.internal_notes || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add notes about this customer (not visible to customer)"
                />
              </div>
            </section>
          )}

          {/* Internal Notes (read mode) */}
          {!isEditing && formData.internal_notes && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-700 mb-1">Internal Notes</p>
              <p className="text-sm text-secondary-700 whitespace-pre-wrap">{formData.internal_notes}</p>
            </div>
          )}

          {/* Summary Boxes */}
          {!isEditing && (
            <div className="space-y-4">
              {/* Active Leads Box */}
              <div className="border border-secondary-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-secondary-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-sm font-semibold text-secondary-900">Leads</h3>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                    {activeLeads.length} active
                  </span>
                </div>
                {isLoadingRelated ? (
                  <div className="p-4">
                    <div className="animate-pulse h-8 bg-secondary-100 rounded" />
                  </div>
                ) : leads.length > 0 ? (
                  <div className="divide-y divide-secondary-100">
                    {leads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/${locale}/employee-portal/leads?leadId=${lead.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">{lead.full_name}</p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {lead.service_type || 'No service'} {lead.approximate_size ? `\u00B7 ${lead.approximate_size}` : ''}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ml-2 ${STATUS_COLORS[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-secondary-400">
                    No leads yet
                  </div>
                )}
              </div>

              {/* Estimates Box */}
              <div className="border border-secondary-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-secondary-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-secondary-900">Estimates</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {estimates.length > 0 && (
                      <span className="text-xs font-medium text-secondary-600">
                        {formatCurrency(estimatesTotal)}
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
                      {estimates.length}
                    </span>
                  </div>
                </div>
                {isLoadingRelated ? (
                  <div className="p-4">
                    <div className="animate-pulse h-8 bg-secondary-100 rounded" />
                  </div>
                ) : estimates.length > 0 ? (
                  <div className="divide-y divide-secondary-100">
                    {estimates.map((estimate) => (
                      <Link
                        key={estimate.id}
                        href={`/${locale}/employee-portal/estimates?estimateId=${estimate.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary-900">
                            {estimate.estimate_id || 'No ID'}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {estimate.service || 'No service'} {'\u00B7'} {formatDate(estimate.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-sm font-semibold text-secondary-900">
                            {formatCurrency(estimate.price)}
                          </span>
                          {estimate.estimate_link && (
                            <span
                              className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                              title="View estimate"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-secondary-400">
                    No estimates yet
                  </div>
                )}
              </div>

              {/* Invoices Box */}
              <div className="border border-secondary-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-secondary-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-secondary-900">Invoices</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoices.length > 0 && (
                      <span className="text-xs font-medium text-secondary-600">
                        {formatCurrency(invoicesTotal)}
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
                      {invoices.length}
                    </span>
                  </div>
                </div>
                {isLoadingRelated ? (
                  <div className="p-4">
                    <div className="animate-pulse h-8 bg-secondary-100 rounded" />
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="divide-y divide-secondary-100">
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/${locale}/employee-portal/invoices?invoiceId=${invoice.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary-900">
                            {invoice.invoice_id || 'No ID'}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {invoice.service || 'No service'} {'\u00B7'} {formatDate(invoice.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                            {INVOICE_STATUS_LABELS[invoice.status]}
                          </span>
                          <span className="text-sm font-semibold text-secondary-900">
                            {formatCurrency(invoice.price)}
                          </span>
                          {invoice.invoice_link && (
                            <span
                              className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                              title="View invoice"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-secondary-400">
                    No invoices yet
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200 shrink-0">
          <div>
            {isEditing && onDelete && !showDeleteConfirm && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Customer
              </Button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Are you sure?</span>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Merge Modal */}
      <CustomerMergeModal
        sourceCustomer={customer}
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onMergeComplete={handleMergeComplete}
      />

      {/* New Lead Modal */}
      <NewLeadModal
        customer={customer}
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onCreate={handleLeadCreate}
      />
    </>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}
