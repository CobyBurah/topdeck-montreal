'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { AddressAutocomplete } from '@/components/forms/AddressAutocomplete'
import { Button } from '@/components/ui/Button'
import { LEAD_LANGUAGES, type LeadLanguage } from '@/types/lead'
import type { Customer } from '@/types/customer'

interface CustomerModalProps {
  customer: Customer | null
  isOpen: boolean
  isNew: boolean
  onClose: () => void
  onCreate: (customer: Customer) => void
}

export function CustomerModal({ customer, isOpen, isNew, onClose, onCreate }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        language: 'en',
        internal_notes: '',
      })
      setError(null)
      setEmailError(null)
    }
  }, [isOpen])

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

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      setError('Full name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    const supabase = createClient()

    const { data, error: insertError } = await supabase
      .from('customers')
      .insert({
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        language: (formData.language as LeadLanguage) || 'en',
        internal_notes: formData.internal_notes || null,
      })
      .select()
      .single()

    setIsSaving(false)

    if (insertError) {
      setError('Failed to create customer. Please try again.')
      console.error('Error creating customer:', insertError)
      return
    }

    onCreate(data as Customer)
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
              <h2 className="text-xl font-bold text-secondary-900">
                Add New Customer
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  placeholder="John Smith"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  error={emailError || undefined}
                  placeholder="john@example.com"
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="(514) 555-1234"
                />

                <AddressAutocomplete
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                  onAddressSelect={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                  placeholder="123 Main St, Montreal, QC"
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
            <div className="flex items-center justify-end px-6 py-4 border-t border-secondary-200 shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Create Customer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
