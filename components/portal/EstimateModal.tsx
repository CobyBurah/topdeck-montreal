'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import type { Estimate } from '@/types/estimate'

interface EstimateModalProps {
  estimate: Estimate | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (estimate: Estimate) => void
  onDelete?: (estimateId: string) => void
}

// Helper component for read-only field display
const DisplayField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-secondary-700 mb-1">{label}</p>
    <p className="text-secondary-900">{value || '—'}</p>
  </div>
)

export function EstimateModal({ estimate, isOpen, onClose, onUpdate, onDelete }: EstimateModalProps) {
  const locale = useLocale()
  const [formData, setFormData] = useState<Partial<Estimate>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (estimate) {
      setFormData(estimate)
      setIsEditing(false)
      setError(null)
    }
  }, [estimate])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancelEdit = () => {
    if (estimate) {
      setFormData(estimate)
    }
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!estimate) return

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('estimates')
      .update({
        estimate_id: formData.estimate_id,
        estimate_link: formData.estimate_link,
        service: formData.service,
        price: formData.price ? parseFloat(String(formData.price)) : null,
        internal_notes: formData.internal_notes,
      })
      .eq('id', estimate.id)
      .select(`
        *,
        customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
      `)
      .single()

    setIsSaving(false)

    if (updateError) {
      setError('Failed to save changes. Please try again.')
      console.error('Error updating estimate:', updateError)
      return
    }

    onUpdate(data as Estimate)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!estimate || !onDelete) return

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('estimates')
      .delete()
      .eq('id', estimate.id)

    setIsDeleting(false)

    if (deleteError) {
      setError('Failed to delete estimate. Please try again.')
      console.error('Error deleting estimate:', deleteError)
      return
    }

    onDelete(estimate.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '—'
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price)
  }

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for estimate ${estimate?.id}`)
    // TODO: Implement actual action handlers
  }

  if (!estimate) return null

  const customer = estimate.customer

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${locale}/employee-portal/customers/${estimate.customer_id}`}
                    className="text-xl font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    {customer?.full_name || 'Unknown Customer'}
                  </Link>
                  <LeadLanguageBadge language={customer?.language ?? 'en'} />
                </div>
                <p className="text-sm text-secondary-500 mt-1">
                  Created: {formatDate(estimate.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 hover:text-secondary-900"
                    title="Edit estimate"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-b border-secondary-200 bg-secondary-50 shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-secondary-600">Actions:</span>
                {estimate.estimate_link && (
                  <a
                    href={estimate.estimate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View in Square
                  </a>
                )}
                <button
                  onClick={() => handleAction('send_followup')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Follow-up
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Customer Information</h3>
                  <DisplayField label="Name" value={customer?.full_name} />
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-1">Email</p>
                    {customer?.email ? (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(customer.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-900 hover:text-primary-500 hover:underline"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <p className="text-secondary-900">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700 mb-1">Phone</p>
                    {customer?.phone ? (
                      <a
                        href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`}
                        className="text-secondary-900 hover:text-primary-500 hover:underline"
                      >
                        {customer.phone}
                      </a>
                    ) : (
                      <p className="text-secondary-900">—</p>
                    )}
                  </div>
                </div>

                {/* Estimate Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Estimate Details</h3>

                  {isEditing ? (
                    <>
                      <Input
                        label="Square Estimate ID"
                        name="estimate_id"
                        value={formData.estimate_id || ''}
                        onChange={handleChange}
                        placeholder="e.g., EST-12345"
                      />
                      <Input
                        label="Estimate Link"
                        name="estimate_link"
                        value={formData.estimate_link || ''}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                      <Input
                        label="Service"
                        name="service"
                        value={formData.service || ''}
                        onChange={handleChange}
                        placeholder="e.g., Deck Staining"
                      />
                      <Input
                        label="Price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={handleChange}
                        placeholder="e.g., 1500.00"
                      />
                      <Textarea
                        label="Internal Notes"
                        name="internal_notes"
                        value={formData.internal_notes || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add notes about this estimate (not visible to customer)"
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Square Estimate ID" value={formData.estimate_id} />
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Estimate Link</p>
                        {formData.estimate_link ? (
                          <a
                            href={formData.estimate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
                          >
                            View Estimate
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <p className="text-secondary-900">—</p>
                        )}
                      </div>
                      <DisplayField label="Service" value={formData.service} />
                      <DisplayField label="Price" value={formatPrice(formData.price ?? null)} />
                      <DisplayField label="Internal Notes" value={formData.internal_notes} />
                    </>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg"
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
                    Delete Estimate
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
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
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
                ) : (
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
