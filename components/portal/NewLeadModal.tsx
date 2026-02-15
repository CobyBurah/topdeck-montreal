'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LEAD_LANGUAGES, LEAD_CONDITIONS, type Lead, type LeadLanguage, type LeadCondition } from '@/types/lead'
import type { Customer } from '@/types/customer'

interface PendingPhoto {
  id: string
  file: File
  previewUrl: string
}

interface NewLeadModalProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
  onCreate: (lead: Lead) => void
}

export function NewLeadModal({ customer, isOpen, onClose, onCreate }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    full_name: customer.full_name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    language: customer.language || 'en',
    service_type: '',
    approximate_size: '',
    preferred_timeline: '',
    additional_details: '',
    condition: '' as LeadCondition | '',
  })
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPhotos: PendingPhoto[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setPendingPhotos((prev) => [...prev, ...newPhotos])

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePendingPhoto = (photoId: string) => {
    setPendingPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId)
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl)
      }
      return prev.filter((p) => p.id !== photoId)
    })
  }

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.email?.trim()) {
      setError('Email is required')
      return
    }

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    // First, create the lead
    const { data: leadData, error: insertError } = await supabase
      .from('leads')
      .insert({
        customer_id: customer.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        language: formData.language as LeadLanguage,
        service_type: formData.service_type || null,
        approximate_size: formData.approximate_size || null,
        preferred_timeline: formData.preferred_timeline || null,
        additional_details: formData.additional_details || null,
        condition: (formData.condition || null) as LeadCondition | null,
        source: 'manual',
        status: 'new',
      })
      .select()
      .single()

    if (insertError) {
      setIsSaving(false)
      setError('Failed to create lead. Please try again.')
      console.error('Error creating lead:', insertError)
      return
    }

    // Create activity log entry (persists even if lead is deleted)
    await supabase.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'lead_created',
      reference_id: leadData.id,
      reference_type: 'lead',
      title: 'Lead Created',
      description: formData.service_type ? `Service: ${formData.service_type}` : null,
      metadata: {
        leadId: leadData.id,
        service: formData.service_type || null,
        leadSource: 'manual',
      },
    })

    // Then, upload any pending photos
    const uploadedPhotos = []
    for (const pendingPhoto of pendingPhotos) {
      const fileName = `${leadData.id}/${Date.now()}-${pendingPhoto.file.name}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('lead-photos')
        .upload(fileName, pendingPhoto.file, {
          contentType: pendingPhoto.file.type,
        })

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        continue
      }

      // Create database record
      const { data: photoRecord, error: photoInsertError } = await supabase
        .from('lead_photos')
        .insert({
          lead_id: leadData.id,
          storage_path: fileName,
          original_filename: pendingPhoto.file.name,
          file_size: pendingPhoto.file.size,
          mime_type: pendingPhoto.file.type,
        })
        .select()
        .single()

      if (photoInsertError) {
        console.error('Error creating photo record:', photoInsertError)
        // Try to clean up the uploaded file
        await supabase.storage.from('lead-photos').remove([fileName])
        continue
      }

      uploadedPhotos.push(photoRecord)
    }

    // Clean up preview URLs
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))

    setIsSaving(false)

    // Return lead with photos
    const leadWithPhotos: Lead = {
      ...leadData,
      lead_photos: uploadedPhotos,
    }

    onCreate(leadWithPhotos)
    handleClose()
  }

  const handleClose = () => {
    // Clean up preview URLs
    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))

    setFormData({
      full_name: customer.full_name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      language: customer.language || 'en',
      service_type: '',
      approximate_size: '',
      preferred_timeline: '',
      additional_details: '',
      condition: '' as LeadCondition | '',
    })
    setPendingPhotos([])
    setError(null)
    setEmailError(null)
    onClose()
  }

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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  New Lead for {customer.full_name}
                </h2>
                <p className="text-sm text-secondary-500">
                  This lead will be linked to the customer automatically
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Contact Information</h3>

                  <Input
                    label="Full Name *"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />

                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    error={emailError || undefined}
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />

                  <Select
                    label="Language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    options={LEAD_LANGUAGES}
                  />
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-secondary-900">Project Details</h3>

                  <Input
                    label="Service Type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    placeholder="e.g., Deck, Fence, Railing"
                  />

                  <Input
                    label="Approximate Size"
                    name="approximate_size"
                    value={formData.approximate_size}
                    onChange={handleChange}
                    placeholder="e.g., 200 sq ft"
                  />

                  <Input
                    label="Preferred Timeline"
                    name="preferred_timeline"
                    value={formData.preferred_timeline}
                    onChange={handleChange}
                    placeholder="e.g., ASAP, 1-2 weeks"
                  />

                  <Textarea
                    label="Additional Details"
                    name="additional_details"
                    value={formData.additional_details}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional information about the project"
                  />

                  <Select
                    label="Condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    options={[{ value: '', label: 'Not Set' }, ...LEAD_CONDITIONS]}
                  />
                </div>

                {/* Photos */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-semibold text-secondary-900">Photos</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {pendingPhotos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square">
                        <img
                          src={photo.previewUrl}
                          alt={photo.file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemovePendingPhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Add photo button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-secondary-300 hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-1 text-secondary-400 hover:text-primary-500"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs">Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

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
            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-secondary-200 shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
