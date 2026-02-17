'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { PhotoGallery } from './PhotoGallery'
import { EditableField } from './EditableField'
import {
  LEAD_CONDITIONS,
  STAIN_CHOICES,
  type LeadPhoto,
} from '@/types/lead'
import type { Estimate } from '@/types/estimate'

interface EstimateDetailPanelProps {
  estimate: Estimate
  onUpdate: (estimate: Estimate) => void
  onDelete?: (estimateId: string) => void
  onBack?: () => void
}

const STAIN_CHOICE_COLORS: Record<string, string> = {
  steina: 'bg-sky-100 text-sky-800',
  ligna: 'bg-emerald-100 text-emerald-800',
  solid: 'bg-violet-100 text-violet-800',
}

const ESTIMATE_SELECT = `
  *,
  customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token),
  lead:leads (*, lead_photos (*))
`

export function EstimateDetailPanel({ estimate, onUpdate, onDelete, onBack }: EstimateDetailPanelProps) {
  const locale = useLocale()
  const lead = estimate.lead || null
  const [photos, setPhotos] = useState<LeadPhoto[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingEstimate, setIsEditingEstimate] = useState(false)
  const [copiedCustomerLink, setCopiedCustomerLink] = useState(false)
  const [copiedPortalLink, setCopiedPortalLink] = useState(false)
  const [estimateForm, setEstimateForm] = useState({
    estimate_id: '',
    service: '',
    price: '',
  })

  // Contact editing state
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  })

  // Stain choices dropdown
  const [showStainChoicesDropdown, setShowStainChoicesDropdown] = useState(false)
  const stainChoicesDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPhotos(lead?.lead_photos || [])
    setError(null)
    setShowDeleteConfirm(false)
    setIsEditingEstimate(false)
    setIsEditingContact(false)
    setShowStainChoicesDropdown(false)
    setEstimateForm({
      estimate_id: estimate.estimate_id || '',
      service: estimate.service || '',
      price: estimate.price != null ? String(estimate.price) : '',
    })
    setContactForm({
      full_name: estimate.customer?.full_name || lead?.full_name || '',
      email: estimate.customer?.email || lead?.email || '',
      phone: estimate.customer?.phone || lead?.phone || '',
      address: estimate.customer?.address || lead?.address || '',
    })
  }, [estimate, lead])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stainChoicesDropdownRef.current && !stainChoicesDropdownRef.current.contains(event.target as Node)) {
        setShowStainChoicesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const customerName = estimate.customer?.full_name || lead?.full_name || 'Unknown'
  const customerEmail = estimate.customer?.email || lead?.email || null
  const customerPhone = estimate.customer?.phone || lead?.phone || null
  const customerAddress = estimate.customer?.address || lead?.address || null
  const customerLanguage = estimate.customer?.language || lead?.language || 'en'
  const customerNotes = estimate.customer?.internal_notes || null

  const formattedPrice = estimate.price != null
    ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(estimate.price)
    : null

  // Contact editing handlers
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const startEditing = () => {
    setContactForm({
      full_name: estimate.customer?.full_name || lead?.full_name || '',
      email: estimate.customer?.email || lead?.email || '',
      phone: estimate.customer?.phone || lead?.phone || '',
      address: estimate.customer?.address || lead?.address || '',
    })
    setEstimateForm({
      estimate_id: estimate.estimate_id || '',
      service: estimate.service || '',
      price: estimate.price != null ? String(estimate.price) : '',
    })
    setIsEditingContact(true)
    setIsEditingEstimate(true)
  }

  const handleEditCancel = () => {
    setContactForm({
      full_name: estimate.customer?.full_name || lead?.full_name || '',
      email: estimate.customer?.email || lead?.email || '',
      phone: estimate.customer?.phone || lead?.phone || '',
      address: estimate.customer?.address || lead?.address || '',
    })
    setEstimateForm({
      estimate_id: estimate.estimate_id || '',
      service: estimate.service || '',
      price: estimate.price != null ? String(estimate.price) : '',
    })
    setIsEditingContact(false)
    setIsEditingEstimate(false)
    setShowDeleteConfirm(false)
  }

  const handleEditSave = async () => {
    setIsSavingContact(true)
    const supabase = createClient()

    // Save contact info
    if (estimate.customer_id) {
      await supabase
        .from('customers')
        .update({
          full_name: contactForm.full_name,
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          address: contactForm.address || null,
        })
        .eq('id', estimate.customer_id)

      // Sync denormalized contact fields on all linked leads
      await supabase
        .from('leads')
        .update({
          full_name: contactForm.full_name,
          email: contactForm.email || '',
          phone: contactForm.phone || null,
          address: contactForm.address || null,
        })
        .eq('customer_id', estimate.customer_id)
    }

    // Save estimate details
    await supabase
      .from('estimates')
      .update({
        estimate_id: estimateForm.estimate_id || null,
        service: estimateForm.service || null,
        price: estimateForm.price ? parseFloat(estimateForm.price) : null,
      })
      .eq('id', estimate.id)

    await refetchEstimate()
    setIsSavingContact(false)
    setIsEditingContact(false)
    setIsEditingEstimate(false)
  }

  const handleEstimateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEstimateForm((prev) => ({ ...prev, [name]: value }))
  }

  // Re-fetch estimate with full joins
  const refetchEstimate = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('estimates')
      .select(ESTIMATE_SELECT)
      .eq('id', estimate.id)
      .single()
    if (data) {
      onUpdate(data as Estimate)
    }
  }


  // Save fields on the estimates table
  const handleEstimateFieldSave = async (fieldName: string, value: string | string[] | null) => {
    const supabase = createClient()
    const { data, error: updateError } = await supabase
      .from('estimates')
      .update({ [fieldName]: value })
      .eq('id', estimate.id)
      .select(ESTIMATE_SELECT)
      .single()

    if (!updateError && data) {
      onUpdate(data as Estimate)
    }
  }

  // Save fields on the linked lead
  const handleLeadFieldSave = async (fieldName: string, value: string | string[] | null) => {
    if (!lead) return
    const supabase = createClient()
    await supabase
      .from('leads')
      .update({ [fieldName]: value })
      .eq('id', lead.id)

    // Re-fetch the estimate to get updated lead data
    await refetchEstimate()
  }

  // Save internal notes on the customer
  const handleNotesSave = async (_fieldName: string, value: string | string[] | null) => {
    if (!estimate.customer_id) return
    const supabase = createClient()
    await supabase
      .from('customers')
      .update({ internal_notes: value as string | null })
      .eq('id', estimate.customer_id)

    await refetchEstimate()
  }

  // Stain choices quick toggle (header dropdown)
  const handleStainChoiceToggle = async (stainValue: string) => {
    if (!lead) return
    const current = lead.stain_choices || []
    const updated = current.includes(stainValue as never)
      ? current.filter((c) => c !== stainValue)
      : [...current, stainValue]
    await handleLeadFieldSave('stain_choices', updated.length > 0 ? updated : null)
  }

  // Photo handlers
  const handlePhotoUpload = (newPhoto: LeadPhoto) => {
    setPhotos((prev) => [...prev, newPhoto])
  }

  const handlePhotoDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const handleDelete = async () => {
    if (!onDelete) return

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
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getOptionLabel = (options: { value: string; label: string }[], value?: string | null) => {
    if (!value) return null
    return options.find((o) => o.value === value)?.label || value
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header: Name + Contact Links */}
      <div className="px-6 py-5 border-b border-secondary-200 shrink-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
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

            {/* Customer name */}
            {isEditingContact ? (
              <input
                name="full_name"
                value={contactForm.full_name}
                onChange={handleContactChange}
                className="text-xl font-bold text-secondary-900 w-full px-2 py-0.5 rounded-lg border border-secondary-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            ) : estimate.customer_id ? (
              <Link
                href={`/${locale}/employee-portal/customers/${estimate.customer_id}`}
                className="text-2xl font-bold text-secondary-900 hover:text-primary-600 transition-colors truncate block"
              >
                {customerName}
              </Link>
            ) : (
              <h1 className="text-2xl font-bold text-secondary-900 truncate">
                {customerName}
              </h1>
            )}

            {/* Clickable contact links / editable inputs */}
            <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
              {isEditingContact ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-secondary-600">
                    <PhoneIcon className="w-4 h-4 shrink-0" />
                    <input
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      placeholder="Phone"
                      className="px-2 py-0.5 rounded-lg border border-secondary-300 bg-white text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-secondary-600">
                    <EmailIcon className="w-4 h-4 shrink-0" />
                    <input
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Email"
                      className="px-2 py-0.5 rounded-lg border border-secondary-300 bg-white text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-secondary-600">
                    <MapPinIcon className="w-4 h-4 shrink-0" />
                    <input
                      name="address"
                      value={contactForm.address}
                      onChange={handleContactChange}
                      placeholder="Address"
                      className="px-2 py-0.5 rounded-lg border border-secondary-300 bg-white text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </span>
                </>
              ) : (
                <>
                  {customerPhone && (
                    <a
                      href={`openphone://dial?number=${encodeURIComponent(customerPhone)}&action=call`}
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      {customerPhone}
                    </a>
                  )}
                  {customerEmail && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(customerEmail)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <EmailIcon className="w-4 h-4" />
                      {customerEmail}
                    </a>
                  )}
                  {customerAddress && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(customerAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      {customerAddress}
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                estimate.status === 'invoice_sent'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-teal-100 text-teal-700'
              }`}>
                {estimate.status === 'invoice_sent' ? 'Converted to Invoice' : 'Estimate Sent'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                {customerLanguage === 'fr' ? 'FR' : 'EN'}
              </span>
              {lead?.condition && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {LEAD_CONDITIONS.find((c) => c.value === lead.condition)?.label || lead.condition}
                </span>
              )}
              {/* Stain choices with dropdown */}
              <div ref={stainChoicesDropdownRef} className="relative">
                <button
                  onClick={() => setShowStainChoicesDropdown(!showStainChoicesDropdown)}
                  className="inline-flex items-center gap-0.5 bg-secondary-100 rounded-full px-0.5 py-0.5 hover:bg-secondary-200 transition-colors cursor-pointer"
                >
                  {lead?.stain_choices && lead.stain_choices.length > 0 ? (
                    lead.stain_choices.map((c) => (
                      <span
                        key={c}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAIN_CHOICE_COLORS[c] || 'bg-secondary-200 text-secondary-700'}`}
                      >
                        {STAIN_CHOICES.find((s) => s.value === c)?.label || c}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 text-xs text-secondary-400">+ Stain</span>
                  )}
                </button>
                {showStainChoicesDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                    {STAIN_CHOICES.map((stain) => {
                      const isSelected = lead?.stain_choices?.includes(stain.value as never) ?? false
                      return (
                        <button
                          key={stain.value}
                          onClick={() => handleStainChoiceToggle(stain.value)}
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-secondary-50 flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-secondary-300"
                          />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAIN_CHOICE_COLORS[stain.value]}`}>
                            {stain.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Save / Cancel (contact info) */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditingContact ? (
              <>
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1.5 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSavingContact}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSavingContact ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600 hover:text-secondary-900"
                title="Edit contact info"
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
          {estimate.estimate_id && (
            <a
              href={`https://app.squareup.com/dashboard/invoices/estimates/${estimate.estimate_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View in Square
            </a>
          )}

          {lead && (
            <Link
              href={`/${locale}/employee-portal/leads?leadId=${lead.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-600 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              View Original Lead
            </Link>
          )}

          {estimate.status === 'invoice_sent' && (
            <Link
              href={`/${locale}/employee-portal/invoices`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              View Invoice
            </Link>
          )}

          {estimate.customer?.access_token && (
            <button
              onClick={() => {
                const link = `${window.location.origin}/auth/auto-login?token=${estimate.customer!.access_token}`
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
            Created {formatDate(estimate.created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Estimate Details (from Square) */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Estimate Details</h3>
          {isEditingEstimate ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-500 mb-1">Estimate ID</label>
                  <input
                    name="estimate_id"
                    value={estimateForm.estimate_id}
                    onChange={handleEstimateFormChange}
                    placeholder="Square estimate ID"
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-500 mb-1">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={estimateForm.price}
                    onChange={handleEstimateFormChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-500 mb-1">Service</label>
                <input
                  name="service"
                  value={estimateForm.service}
                  onChange={handleEstimateFormChange}
                  placeholder="e.g., Deck Staining"
                  className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-secondary-50 rounded-xl p-4 space-y-3">
              {formattedPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-600">Price</span>
                  <span className="text-xl font-bold text-green-700">{formattedPrice}</span>
                </div>
              )}
              {estimate.estimate_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-600">Estimate ID</span>
                  <span className="text-sm text-secondary-900 font-mono">{estimate.estimate_id}</span>
                </div>
              )}
              {estimate.service && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-600">Service</span>
                  <span className="text-sm text-secondary-900">{estimate.service}</span>
                </div>
              )}
              {estimate.estimate_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-600">Customer Link</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://app.squareup.com/pay-invoice/estimate/${estimate.estimate_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 truncate max-w-[200px]"
                    >
                      pay-invoice/estimate/{estimate.estimate_id.slice(0, 8)}...
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://app.squareup.com/pay-invoice/estimate/${estimate.estimate_id}`)
                        setCopiedCustomerLink(true)
                        setTimeout(() => setCopiedCustomerLink(false), 2000)
                      }}
                      className="p-1 hover:bg-secondary-200 rounded transition-colors text-secondary-500 hover:text-secondary-700"
                      title="Copy customer link"
                    >
                      {copiedCustomerLink ? (
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {!formattedPrice && !estimate.estimate_id && !estimate.service && (
                <p className="text-sm text-secondary-400 text-center py-2">No estimate details yet</p>
              )}
            </div>
          )}
        </section>

        {/* Photos (from linked lead) */}
        {lead && (
          <section>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Photos</h3>
            <PhotoGallery
              leadId={lead.id}
              photos={photos}
              editable={true}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
            />
          </section>
        )}

        {/* Project Details (from linked lead) - Editable */}
        {lead && (
          <section>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Project Details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <EditableField
                label="Service"
                value={lead.service_type}
                fieldName="service_type"
                type="text"
                onSave={handleLeadFieldSave}
                placeholder="e.g., Deck, Fence"
              />
              <EditableField
                label="Size"
                value={lead.approximate_size}
                fieldName="approximate_size"
                type="text"
                onSave={handleLeadFieldSave}
                placeholder="e.g., 200 sq ft"
              />
              <EditableField
                label="Condition"
                value={lead.condition}
                displayValue={getOptionLabel(LEAD_CONDITIONS, lead.condition)}
                fieldName="condition"
                type="select"
                options={[{ value: '', label: 'Not Set' }, ...LEAD_CONDITIONS]}
                onSave={handleLeadFieldSave}
              />
            </div>
            <div className="mt-3">
              <EditableField
                label="Details"
                value={lead.additional_details}
                fieldName="additional_details"
                type="textarea"
                onSave={handleLeadFieldSave}
              />
            </div>
          </section>
        )}

        {/* CRM */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">CRM</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {lead && (
              <EditableField
                label="Stain Choices"
                value={null}
                displayValue={
                  lead.stain_choices && lead.stain_choices.length > 0
                    ? lead.stain_choices.map((c) => STAIN_CHOICES.find((s) => s.value === c)?.label || c).join(', ')
                    : 'Not Set'
                }
                fieldName="stain_choices"
                type="multi-select"
                options={STAIN_CHOICES}
                multiValue={lead.stain_choices || []}
                onSave={handleLeadFieldSave}
              />
            )}
          </div>
        </section>

        {/* Internal Notes (customer-level) */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Notes</h3>
          <div className={customerNotes ? 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg' : ''}>
            <EditableField
              label="Internal Notes"
              value={customerNotes}
              fieldName="internal_notes"
              type="textarea"
              onSave={handleNotesSave}
              placeholder="Add notes (not visible to customer)"
            />
          </div>
        </section>

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
          {onDelete && isEditingContact && !showDeleteConfirm && (
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
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div />
      </div>
    </div>
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
