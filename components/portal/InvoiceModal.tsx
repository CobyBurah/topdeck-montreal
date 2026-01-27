'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import type { Invoice, InvoiceStatus } from '@/types/invoice'
import { INVOICE_STATUSES } from '@/types/invoice'

interface InvoiceModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (invoice: Invoice) => void
  onDelete?: (invoiceId: string) => void
}

const statusStyles: Record<InvoiceStatus, string> = {
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-secondary-100 text-secondary-700',
  refunded: 'bg-orange-100 text-orange-700',
}

const statusLabels: Record<InvoiceStatus, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

// Helper component for read-only field display
const DisplayField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-secondary-700 mb-1">{label}</p>
    <p className="text-secondary-900">{value || '—'}</p>
  </div>
)

export function InvoiceModal({ invoice, isOpen, onClose, onUpdate, onDelete }: InvoiceModalProps) {
  const locale = useLocale()
  const [formData, setFormData] = useState<Partial<Invoice>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (invoice) {
      setFormData(invoice)
      setIsEditing(false)
      setError(null)
    }
  }, [invoice])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancelEdit = () => {
    if (invoice) {
      setFormData(invoice)
    }
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!invoice) return

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from('invoices')
      .update({
        invoice_id: formData.invoice_id,
        invoice_link: formData.invoice_link,
        service: formData.service,
        price: formData.price ? parseFloat(String(formData.price)) : null,
        status: formData.status,
        internal_notes: formData.internal_notes,
      })
      .eq('id', invoice.id)
      .select(`
        *,
        customer:customers (id, full_name, email, phone, language)
      `)
      .single()

    setIsSaving(false)

    if (updateError) {
      setError('Failed to save changes. Please try again.')
      console.error('Error updating invoice:', updateError)
      return
    }

    onUpdate(data as Invoice)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!invoice || !onDelete) return

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id)

    setIsDeleting(false)

    if (deleteError) {
      setError('Failed to delete invoice. Please try again.')
      console.error('Error deleting invoice:', deleteError)
      return
    }

    onDelete(invoice.id)
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
    console.log(`Action: ${action} for invoice ${invoice?.id}`)
    // TODO: Implement actual action handlers
  }

  if (!invoice) return null

  const customer = invoice.customer

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
                    href={`/${locale}/portal/customers/${invoice.customer_id}`}
                    className="text-xl font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    {customer?.full_name || 'Unknown Customer'}
                  </Link>
                  <LeadLanguageBadge language={customer?.language ?? 'en'} />
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[invoice.status]}`}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </div>
                <p className="text-sm text-secondary-500 mt-1">
                  Created: {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 hover:text-secondary-900"
                    title="Edit invoice"
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
                {invoice.invoice_link && (
                  <a
                    href={invoice.invoice_link}
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

                {/* Invoice Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Invoice Details</h3>

                  {isEditing ? (
                    <>
                      <Input
                        label="Square Invoice ID"
                        name="invoice_id"
                        value={formData.invoice_id || ''}
                        onChange={handleChange}
                        placeholder="e.g., INV-12345"
                      />
                      <Input
                        label="Invoice Link"
                        name="invoice_link"
                        value={formData.invoice_link || ''}
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
                      <Select
                        label="Status"
                        name="status"
                        value={formData.status || 'sent'}
                        onChange={handleChange}
                        options={INVOICE_STATUSES}
                      />
                      <Textarea
                        label="Internal Notes"
                        name="internal_notes"
                        value={formData.internal_notes || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add notes about this invoice (not visible to customer)"
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Square Invoice ID" value={formData.invoice_id} />
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Invoice Link</p>
                        {formData.invoice_link ? (
                          <a
                            href={formData.invoice_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
                          >
                            View Invoice
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
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Status</p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[formData.status as InvoiceStatus || 'sent']}`}
                        >
                          {statusLabels[formData.status as InvoiceStatus || 'sent']}
                        </span>
                      </div>
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
                    Delete Invoice
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
