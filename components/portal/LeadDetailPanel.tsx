'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { CreateEstimateModal } from './CreateEstimateModal'
import { PhotoGallery } from './PhotoGallery'
import { EditableField } from './EditableField'
import { LeadStatusBadge } from './LeadStatusBadge'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_LANGUAGES,
  LEAD_CONDITIONS,
  STAIN_CHOICES,
  type Lead,
  type LeadStatus,
  type LeadLanguage,
  type LeadPhoto,
} from '@/types/lead'
import { resolveStainById } from '@/lib/stain-data'

interface LeadDetailPanelProps {
  lead: Lead
  onUpdate: (lead: Lead) => void
  onDelete?: (leadId: string) => void
  onBack?: () => void
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  needs_more_details: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-purple-100 text-purple-700',
  quote_sent: 'bg-orange-100 text-orange-700',
  estimate_sent: 'bg-teal-100 text-teal-700',
  invoiced: 'bg-cyan-100 text-cyan-700',
  booked: 'bg-green-100 text-green-700',
  complete: 'bg-secondary-100 text-secondary-700',
}

const STAIN_CHOICE_COLORS: Record<string, string> = {
  steina: 'bg-sky-100 text-sky-800',
  ligna: 'bg-emerald-100 text-emerald-800',
  solid: 'bg-violet-100 text-violet-800',
}

export function LeadDetailPanel({ lead, onUpdate, onDelete, onBack }: LeadDetailPanelProps) {
  const locale = useLocale()
  const [photos, setPhotos] = useState<LeadPhoto[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showConditionDropdown, setShowConditionDropdown] = useState(false)
  const [showStainChoicesDropdown, setShowStainChoicesDropdown] = useState(false)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [copiedPortalLink, setCopiedPortalLink] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const conditionDropdownRef = useRef<HTMLDivElement>(null)
  const stainChoicesDropdownRef = useRef<HTMLDivElement>(null)

  // Derive contact display values - prefer customer data when linked
  const displayName = lead.customer?.full_name ?? lead.full_name
  const displayEmail = lead.customer?.email ?? lead.email
  const displayPhone = lead.customer?.phone ?? lead.phone
  const displayAddress = lead.customer?.address ?? lead.address

  useEffect(() => {
    setPhotos(lead.lead_photos || [])
    setError(null)
    setShowDeleteConfirm(false)
    setShowStatusDropdown(false)
    setShowConditionDropdown(false)
    setShowStainChoicesDropdown(false)
    setShowEstimateModal(false)
    setIsEditingContact(false)
    setContactForm({
      full_name: lead.customer?.full_name ?? lead.full_name ?? '',
      email: lead.customer?.email ?? lead.email ?? '',
      phone: lead.customer?.phone ?? lead.phone ?? '',
      address: lead.customer?.address ?? lead.address ?? '',
    })
  }, [lead])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(event.target as Node)) {
        setShowConditionDropdown(false)
      }
      if (stainChoicesDropdownRef.current && !stainChoicesDropdownRef.current.contains(event.target as Node)) {
        setShowStainChoicesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePhotoUpload = (newPhoto: LeadPhoto) => {
    setPhotos((prev) => [...prev, newPhoto])
  }

  const handlePhotoDelete = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const handleQuickUpdate = async (fields: Partial<Lead>) => {
    const supabase = createClient()
    const { data, error: updateError } = await supabase
      .from('leads')
      .update(fields)
      .eq('id', lead.id)
      .select(`
        *,
        lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
        customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
      `)
      .single()

    if (!updateError && data) {
      // Preserve updated_at when status wasn't changed,
      // so the stale indicator isn't incorrectly cleared
      if (!('status' in fields)) {
        (data as Lead).updated_at = lead.updated_at
      }
      onUpdate(data as Lead)
    }
  }

  const handleFieldSave = async (fieldName: string, value: string | string[] | null) => {
    await handleQuickUpdate({ [fieldName]: value } as Partial<Lead>)
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactSave = async () => {
    setIsSavingContact(true)
    const supabase = createClient()

    if (lead.customer_id) {
      // Update the canonical customer record (source of truth)
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          full_name: contactForm.full_name,
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          address: contactForm.address || null,
        })
        .eq('id', lead.customer_id)

      if (!customerError) {
        // Sync denormalized fields on this lead (and all sibling leads)
        await supabase
          .from('leads')
          .update({
            full_name: contactForm.full_name,
            email: contactForm.email || '',
            phone: contactForm.phone || null,
            address: contactForm.address || null,
          })
          .eq('customer_id', lead.customer_id)

        // Re-fetch lead with updated customer join
        const { data } = await supabase
          .from('leads')
          .select(`
            *,
            lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
            customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
          `)
          .eq('id', lead.id)
          .single()

        if (data) onUpdate(data as Lead)
      }
    } else {
      // No customer linked - fall back to updating lead only
      await handleQuickUpdate({
        full_name: contactForm.full_name,
        email: contactForm.email,
        phone: contactForm.phone,
        address: contactForm.address,
      })
    }

    setIsSavingContact(false)
    setIsEditingContact(false)
    setShowDeleteConfirm(false)
  }

  const handleContactCancel = () => {
    setContactForm({
      full_name: lead.customer?.full_name ?? lead.full_name ?? '',
      email: lead.customer?.email ?? lead.email ?? '',
      phone: lead.customer?.phone ?? lead.phone ?? '',
      address: lead.customer?.address ?? lead.address ?? '',
    })
    setIsEditingContact(false)
    setShowDeleteConfirm(false)
  }

  const startEditingContact = () => {
    setContactForm({
      full_name: lead.customer?.full_name ?? lead.full_name ?? '',
      email: lead.customer?.email ?? lead.email ?? '',
      phone: lead.customer?.phone ?? lead.phone ?? '',
      address: lead.customer?.address ?? lead.address ?? '',
    })
    setIsEditingContact(true)
  }

  const handleCustomerNotesSave = async (_fieldName: string, value: string | string[] | null) => {
    if (!lead.customer_id) return
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('customers')
      .update({ internal_notes: value as string | null })
      .eq('id', lead.customer_id)
    if (!updateError) {
      const { data } = await supabase
        .from('leads')
        .select(`
          *,
          lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
          customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
        `)
        .eq('id', lead.id)
        .single()
      if (data) onUpdate(data as Lead)
    }
  }

  const handleCustomerLanguageSave = async (_fieldName: string, value: string | string[] | null) => {
    if (!lead.customer_id) return
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('customers')
      .update({ language: value as LeadLanguage })
      .eq('id', lead.customer_id)
    if (!updateError) {
      // Re-fetch lead with updated customer relation
      const { data } = await supabase
        .from('leads')
        .select(`
          *,
          lead_photos (id, lead_id, storage_path, original_filename, file_size, mime_type, uploaded_at),
          customer:customers (id, full_name, email, phone, address, language, internal_notes, access_token)
        `)
        .eq('id', lead.id)
        .single()
      if (data) onUpdate(data as Lead)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

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
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleAction = (action: string) => {
    if (action === 'create_estimate') {
      setShowEstimateModal(true)
      return
    }
    console.log(`Action: ${action} for lead ${lead.id}`)
  }

  const getOptionLabel = (options: { value: string; label: string }[], value?: string | null) => {
    if (!value) return null
    return options.find((o) => o.value === value)?.label || value
  }

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

            {/* Customer name */}
            {isEditingContact ? (
              <input
                name="full_name"
                value={contactForm.full_name}
                onChange={handleContactChange}
                className="text-xl font-bold text-secondary-900 w-full px-2 py-0.5 rounded-lg border border-secondary-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            ) : lead.customer_id ? (
              <Link
                href={`/${locale}/employee-portal/customers/${lead.customer_id}`}
                className="text-2xl font-bold text-secondary-900 hover:text-primary-600 transition-colors truncate block"
              >
                {displayName}
              </Link>
            ) : (
              <h1 className="text-2xl font-bold text-secondary-900 truncate">
                {displayName}
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
                  {displayPhone && (
                    <a
                      href={`openphone://dial?number=${encodeURIComponent(displayPhone)}&action=call`}
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      {displayPhone}
                    </a>
                  )}
                  {displayEmail && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(displayEmail)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <EmailIcon className="w-4 h-4" />
                      {displayEmail}
                    </a>
                  )}
                  {displayAddress && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(displayAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      {displayAddress}
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Status dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                  <LeadStatusBadge status={lead.status} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 py-1">
                    {LEAD_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          setShowStatusDropdown(false)
                          if (s.value !== lead.status) handleQuickUpdate({ status: s.value })
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors ${
                          s.value === lead.status ? 'font-medium' : ''
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s.value].split(' ')[0]}`} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <LeadLanguageBadge language={lead.customer?.language ?? 'en'} />

              {/* Condition dropdown */}
              <div className="relative" ref={conditionDropdownRef}>
                <button onClick={() => setShowConditionDropdown(!showConditionDropdown)}>
                  {lead.condition ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:opacity-80 transition-opacity">
                      {LEAD_CONDITIONS.find((c) => c.value === lead.condition)?.label || lead.condition}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-secondary-300 text-secondary-400 cursor-pointer hover:border-secondary-400 hover:text-secondary-500 transition-colors">
                      + Add Condition
                    </span>
                  )}
                </button>
                {showConditionDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 py-1">
                    <button
                      onClick={() => {
                        setShowConditionDropdown(false)
                        if (lead.condition) handleQuickUpdate({ condition: null })
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors text-secondary-400 ${
                        !lead.condition ? 'font-medium' : ''
                      }`}
                    >
                      None
                    </button>
                    {LEAD_CONDITIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setShowConditionDropdown(false)
                          if (c.value !== lead.condition) handleQuickUpdate({ condition: c.value })
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors ${
                          c.value === lead.condition ? 'font-medium text-amber-800' : ''
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stain Choices dropdown */}
              <div className="relative" ref={stainChoicesDropdownRef}>
                <button onClick={() => setShowStainChoicesDropdown(!showStainChoicesDropdown)}>
                  {lead.stain_choices && lead.stain_choices.length > 0 ? (
                    <span className="inline-flex items-center gap-0.5 bg-secondary-100 rounded-full px-0.5 py-0.5 cursor-pointer hover:bg-secondary-200 transition-colors">
                      {lead.stain_choices.map((c) => (
                        <span
                          key={c}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAIN_CHOICE_COLORS[c] || 'bg-secondary-200 text-secondary-700'}`}
                        >
                          {STAIN_CHOICES.find((s) => s.value === c)?.label || c}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-secondary-300 text-secondary-400 cursor-pointer hover:border-secondary-400 hover:text-secondary-500 transition-colors">
                      + Stain Choices
                    </span>
                  )}
                </button>
                {showStainChoicesDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 py-1">
                    {STAIN_CHOICES.map((s) => {
                      const currentChoices = lead.stain_choices || []
                      const isSelected = currentChoices.includes(s.value)
                      return (
                        <button
                          key={s.value}
                          onClick={() => {
                            const updated = isSelected
                              ? currentChoices.filter((c) => c !== s.value)
                              : [...currentChoices, s.value]
                            handleQuickUpdate({ stain_choices: updated } as Partial<Lead>)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary-50 transition-colors"
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? `${STAIN_CHOICE_COLORS[s.value] || 'bg-secondary-200 text-secondary-700'} border-transparent` : 'border-secondary-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Favourite stains (read-only, set by customer) */}
              {lead.favourite_stains && lead.favourite_stains.length > 0 && (
                <div className="inline-flex items-center gap-1 bg-pink-50 rounded-full px-2 py-0.5">
                  <svg className="w-3 h-3 text-pink-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {lead.favourite_stains.map((stainId) => {
                    const resolved = resolveStainById(stainId)
                    const label = resolved ? resolved.color.nameKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()) : stainId
                    return (
                      <span key={stainId} className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditingContact ? (
              <>
                <button
                  onClick={handleContactCancel}
                  className="px-3 py-1.5 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContactSave}
                  disabled={isSavingContact}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSavingContact ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={startEditingContact}
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
          <button
            onClick={() => handleAction('ask_for_pictures')}
            className="p-2.5 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Request Photos"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAction('ask_to_call')}
            className="p-2.5 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Log Call"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAction('in_person_estimate')}
            className="p-2.5 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Book In-Person"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>

          {lead.customer?.access_token && (
            <button
              onClick={() => {
                const link = `${window.location.origin}/auth/auto-login?token=${lead.customer!.access_token}`
                navigator.clipboard.writeText(link)
                setCopiedPortalLink(true)
                setTimeout(() => setCopiedPortalLink(false), 2000)
              }}
              className="p-2.5 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Copy Client Portal Link"
            >
              {copiedPortalLink ? (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </button>
          )}

          <div className="w-px h-6 bg-secondary-200 mx-1" />

          <span className="text-xs text-secondary-500">
            Created {formatDate(lead.created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Photos */}
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

        {/* Project Details */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Project Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <EditableField
              label="Service"
              value={lead.service_type}
              fieldName="service_type"
              type="text"
              onSave={handleFieldSave}
              placeholder="e.g., Deck, Fence"
            />
            <EditableField
              label="Size"
              value={lead.approximate_size}
              fieldName="approximate_size"
              type="text"
              onSave={handleFieldSave}
              placeholder="e.g., 200 sq ft"
            />
            <EditableField
              label="Condition"
              value={lead.condition}
              displayValue={getOptionLabel(LEAD_CONDITIONS, lead.condition)}
              fieldName="condition"
              type="select"
              options={[{ value: '', label: 'Not Set' }, ...LEAD_CONDITIONS]}
              onSave={handleFieldSave}
            />
          </div>
          <div className="mt-3">
            <EditableField
              label="Details"
              value={lead.additional_details}
              fieldName="additional_details"
              type="textarea"
              onSave={handleFieldSave}
            />
          </div>
        </section>

        {/* CRM Fields */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">CRM</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <EditableField
              label="Status"
              value={lead.status}
              displayValue={getOptionLabel(LEAD_STATUSES, lead.status)}
              fieldName="status"
              type="select"
              options={LEAD_STATUSES}
              onSave={handleFieldSave}
            />
            <EditableField
              label="Source"
              value={lead.source}
              displayValue={getOptionLabel(LEAD_SOURCES, lead.source)}
              fieldName="source"
              type="select"
              options={LEAD_SOURCES}
              onSave={handleFieldSave}
            />
            <EditableField
              label="Language"
              value={lead.customer?.language ?? 'en'}
              displayValue={getOptionLabel(LEAD_LANGUAGES, lead.customer?.language ?? 'en')}
              fieldName="language"
              type="select"
              options={LEAD_LANGUAGES}
              onSave={handleCustomerLanguageSave}
            />
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
              onSave={handleFieldSave}
            />
          </div>
          <div className={`mt-3 ${lead.customer?.internal_notes ? 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg' : ''}`}>
            <EditableField
              label="Internal Notes"
              value={lead.customer?.internal_notes ?? null}
              fieldName="internal_notes"
              type="textarea"
              onSave={handleCustomerNotesSave}
              placeholder="Add notes (not visible to customer)"
            />
          </div>
        </section>

        {/* Estimate Block */}
        <section>
          <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wider mb-3">Estimate</h3>
          {lead.status === 'estimate_sent' ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-teal-800">Converted to Estimate</span>
              </div>
              <p className="text-xs text-teal-600 mt-1">This lead has been converted to an estimate via Square.</p>
              <Link
                href={`/${locale}/employee-portal/estimates`}
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-teal-700 hover:text-teal-900 transition-colors"
              >
                View in Estimates
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="border-2 border-dashed border-secondary-200 rounded-xl p-6 text-center">
              <p className="text-sm text-secondary-400 mb-3">No estimate created yet</p>
              <button
                onClick={() => handleAction('create_estimate')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Estimate
              </button>
            </div>
          )}
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
              Delete Lead
            </Button>
          )}
          {isEditingContact && showDeleteConfirm && (
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

    <CreateEstimateModal
      lead={lead}
      isOpen={showEstimateModal}
      onClose={() => setShowEstimateModal(false)}
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

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}
