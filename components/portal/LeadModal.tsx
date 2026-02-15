'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PhotoGallery } from './PhotoGallery'
import { LeadStatusBadge } from './LeadStatusBadge'
import { LeadSourceBadge } from './LeadSourceBadge'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_LANGUAGES, LEAD_CONDITIONS, type Lead, type LeadStatus, type LeadSource, type LeadLanguage, type LeadCondition, type LeadPhoto, type LeadCustomer } from '@/types/lead'

interface LeadModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (lead: Lead) => void
  onDelete?: (leadId: string) => void
}

// Helper component for read-only field display
const DisplayField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-secondary-700 mb-1">{label}</p>
    <p className="text-secondary-900">{value || '—'}</p>
  </div>
)

export function LeadModal({ lead, isOpen, onClose, onUpdate, onDelete }: LeadModalProps) {
  const locale = useLocale()
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [customerLanguage, setCustomerLanguage] = useState<LeadLanguage>('en')
  const [photos, setPhotos] = useState<LeadPhoto[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (lead) {
      setFormData(lead)
      setCustomerLanguage(lead.customer?.language ?? 'en')
      setPhotos(lead.lead_photos || [])
      setIsEditing(false)
      setError(null)
      setEmailError(null)
    }
  }, [lead])

  const handlePhotoUpload = (newPhoto: LeadPhoto) => {
    setPhotos((prev) => [...prev, newPhoto])
  }

  const handlePhotoDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

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
    if (lead) {
      setFormData(lead)
      setCustomerLanguage(lead.customer?.language ?? 'en')
    }
    setIsEditing(false)
    setError(null)
    setEmailError(null)
  }

  const handleSave = async () => {
    if (!lead) return

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    // Update customer language if customer exists
    if (lead.customer_id) {
      const { error: customerError } = await supabase
        .from('customers')
        .update({ language: customerLanguage })
        .eq('id', lead.customer_id)

      if (customerError) {
        setError('Failed to save customer language. Please try again.')
        console.error('Error updating customer:', customerError)
        setIsSaving(false)
        return
      }
    }

    const { data, error: updateError } = await supabase
      .from('leads')
      .update({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        service_type: formData.service_type,
        approximate_size: formData.approximate_size,
        preferred_timeline: formData.preferred_timeline,
        additional_details: formData.additional_details,
        source: formData.source as LeadSource,
        status: formData.status as LeadStatus,
        condition: (formData.condition || null) as LeadCondition | null,
        internal_notes: formData.internal_notes,
      })
      .eq('id', lead.id)
      .select(`
        *,
        lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
        customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
      `)
      .single()

    setIsSaving(false)

    if (updateError) {
      setError('Failed to save changes. Please try again.')
      console.error('Error updating lead:', updateError)
      return
    }

    onUpdate(data as Lead)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!lead || !onDelete) return

    setIsDeleting(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', lead.id)

    setIsDeleting(false)

    if (deleteError) {
      setError('Failed to delete lead. Please try again.')
      console.error('Error deleting lead:', deleteError)
      return
    }

    onDelete(lead.id)
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

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for lead ${lead?.id}`)
    // TODO: Implement actual action handlers
  }

  const getOptionLabel = (options: { value: string; label: string }[], value?: string | null) => {
    if (!value) return null
    return options.find(o => o.value === value)?.label || value
  }

  if (!lead) return null

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  {lead.customer_id ? (
                    <Link
                      href={`/${locale}/employee-portal/customers/${lead.customer_id}`}
                      className="text-xl font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                    >
                      {formData.full_name}
                    </Link>
                  ) : (
                    <h2 className="text-xl font-bold text-secondary-900">
                      {formData.full_name}
                    </h2>
                  )}
                  <LeadStatusBadge status={lead.status} />
                  <LeadSourceBadge source={lead.source} />
                  <LeadLanguageBadge language={lead.customer?.language ?? 'en'} />
                </div>
                <p className="text-sm text-secondary-500 mt-1">
                  Created: {formatDate(lead.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 hover:text-secondary-900"
                    title="Edit lead"
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
                <button
                  onClick={() => handleAction('ask_for_pictures')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ask for Pictures
                </button>
                <button
                  onClick={() => handleAction('ask_to_call')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Ask to Call
                </button>
                <button
                  onClick={() => handleAction('in_person_estimate')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  In-Person Estimate
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Contact Information</h3>

                  {isEditing ? (
                    <>
                      <Input
                        label="Full Name"
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
                    </>
                  ) : (
                    <>
                      <DisplayField label="Full Name" value={formData.full_name} />
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Email</p>
                        {formData.email ? (
                          <a
                            href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(formData.email)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary-900 hover:text-primary-500 hover:underline"
                          >
                            {formData.email}
                          </a>
                        ) : (
                          <p className="text-secondary-900">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Phone</p>
                        {formData.phone ? (
                          <a
                            href={`openphone://dial?number=${encodeURIComponent(formData.phone)}&action=call`}
                            className="text-secondary-900 hover:text-primary-500 hover:underline"
                          >
                            {formData.phone}
                          </a>
                        ) : (
                          <p className="text-secondary-900">—</p>
                        )}
                      </div>
                      <DisplayField label="Address" value={formData.address} />
                    </>
                  )}
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Project Details</h3>

                  {isEditing ? (
                    <>
                      <Input
                        label="Service Type"
                        name="service_type"
                        value={formData.service_type || ''}
                        onChange={handleChange}
                        placeholder="e.g., Deck, Fence, Railing"
                      />
                      <Input
                        label="Approximate Size"
                        name="approximate_size"
                        value={formData.approximate_size || ''}
                        onChange={handleChange}
                        placeholder="e.g., 200 sq ft"
                      />
                      <Input
                        label="Preferred Timeline"
                        name="preferred_timeline"
                        value={formData.preferred_timeline || ''}
                        onChange={handleChange}
                        placeholder="e.g., ASAP, 1-2 weeks"
                      />
                      <Textarea
                        label="Additional Details"
                        name="additional_details"
                        value={formData.additional_details || ''}
                        onChange={handleChange}
                        rows={3}
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Service Type" value={formData.service_type} />
                      <DisplayField label="Approximate Size" value={formData.approximate_size} />
                      <DisplayField label="Preferred Timeline" value={formData.preferred_timeline} />
                      <DisplayField label="Additional Details" value={formData.additional_details} />
                    </>
                  )}
                </div>

                {/* CRM Fields */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">CRM Fields</h3>

                  {isEditing ? (
                    <>
                      <Select
                        label="Status"
                        name="status"
                        value={formData.status || 'new'}
                        onChange={handleChange}
                        options={LEAD_STATUSES}
                      />
                      <Select
                        label="Source"
                        name="source"
                        value={formData.source || 'form'}
                        onChange={handleChange}
                        options={LEAD_SOURCES}
                      />
                      <Select
                        label="Language (Customer)"
                        name="customerLanguage"
                        value={customerLanguage}
                        onChange={(e) => setCustomerLanguage(e.target.value as LeadLanguage)}
                        options={LEAD_LANGUAGES}
                      />
                      <Select
                        label="Condition"
                        name="condition"
                        value={formData.condition || ''}
                        onChange={handleChange}
                        options={[{ value: '', label: 'Not Set' }, ...LEAD_CONDITIONS]}
                      />
                      <Textarea
                        label="Internal Notes"
                        name="internal_notes"
                        value={formData.internal_notes || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add notes about this lead (not visible to customer)"
                      />
                    </>
                  ) : (
                    <>
                      <DisplayField label="Status" value={getOptionLabel(LEAD_STATUSES, formData.status)} />
                      <DisplayField label="Source" value={getOptionLabel(LEAD_SOURCES, formData.source)} />
                      <DisplayField label="Language (Customer)" value={getOptionLabel(LEAD_LANGUAGES, customerLanguage)} />
                      <DisplayField label="Condition" value={getOptionLabel(LEAD_CONDITIONS, formData.condition) || 'Not Set'} />
                      <DisplayField label="Internal Notes" value={formData.internal_notes} />
                    </>
                  )}
                </div>

                {/* Photos */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Photos</h3>
                  <PhotoGallery
                    leadId={lead.id}
                    photos={photos}
                    editable={isEditing}
                    onUpload={handlePhotoUpload}
                    onDelete={handlePhotoDelete}
                  />
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
                    Delete Lead
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
