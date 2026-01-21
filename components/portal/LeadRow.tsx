'use client'

import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { LeadStatusBadge } from './LeadStatusBadge'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { LeadConditionBadge } from './LeadConditionBadge'
import { PhotoLightbox } from './PhotoGallery'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStatus, LeadCondition, LeadLanguage } from '@/types/lead'
import { LEAD_STATUSES, LEAD_CONDITIONS, LEAD_LANGUAGES } from '@/types/lead'

interface LeadRowProps {
  lead: Lead
  onEdit: () => void
  onUpdate: (lead: Lead) => void
}

export function LeadRow({ lead, onEdit, onUpdate }: LeadRowProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [editingField, setEditingField] = useState<'status' | 'condition' | 'language' | null>(null)
  const [fieldDropdownPosition, setFieldDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fieldDropdownRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const supabase = createClient()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setActionsOpen(false)
      }
      if (
        fieldDropdownRef.current &&
        !fieldDropdownRef.current.contains(target)
      ) {
        setEditingField(null)
      }
    }

    if (actionsOpen || editingField) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [actionsOpen, editingField])

  // Update dropdown position when opening
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!actionsOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
      })
    }
    setActionsOpen(!actionsOpen)
  }

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for lead ${lead.id}`)
    setActionsOpen(false)
  }

  const handleFieldClick = (field: 'status' | 'condition' | 'language', e: React.MouseEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setFieldDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    })
    setEditingField(field)
  }

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setEditingField(null)
    const { data, error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', lead.id)
      .select('*, lead_photos(*), customer:customers(id, full_name, email, phone, language)')
      .single()

    if (!error && data) {
      onUpdate(data as Lead)
    }
  }

  const handleConditionChange = async (newCondition: LeadCondition | null) => {
    setEditingField(null)
    const { data, error } = await supabase
      .from('leads')
      .update({ condition: newCondition })
      .eq('id', lead.id)
      .select('*, lead_photos(*), customer:customers(id, full_name, email, phone, language)')
      .single()

    if (!error && data) {
      onUpdate(data as Lead)
    }
  }

  const handleLanguageChange = async (newLanguage: LeadLanguage) => {
    setEditingField(null)
    if (!lead.customer_id) return

    // Update the customer's language
    const { error: customerError } = await supabase
      .from('customers')
      .update({ language: newLanguage })
      .eq('id', lead.customer_id)

    if (customerError) return

    // Refetch the lead with updated customer data
    const { data, error } = await supabase
      .from('leads')
      .select('*, lead_photos(*), customer:customers(id, full_name, email, phone, language)')
      .eq('id', lead.id)
      .single()

    if (!error && data) {
      onUpdate(data as Lead)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }
  }

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('lead-photos').getPublicUrl(storagePath)
    return data.publicUrl
  }

  const formatServiceType = (serviceType: string | null) => {
    if (!serviceType) return '-'
    const labels: Record<string, string> = {
      deck: 'Deck',
      fence: 'Fence',
      pergola: 'Pergola/Gazebo',
      multiple: 'Multiple Surfaces',
      other: 'Other',
    }
    return labels[serviceType] || serviceType
  }

  const photos = lead.lead_photos || []
  const createdAt = formatDate(lead.created_at)

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onEdit}
        className="hover:bg-secondary-50 transition-colors cursor-pointer"
      >
        <td className="px-6 py-4">
          {lead.customer_id ? (
            <Link
              href={`/${locale}/portal/customers/${lead.customer_id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              {lead.full_name}
            </Link>
          ) : (
            <div className="font-medium text-secondary-900">{lead.full_name}</div>
          )}
        </td>
        <td className="px-6 py-4">
          {lead.email && (
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(lead.email)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block text-sm text-secondary-600 hover:text-primary-500 hover:underline"
            >
              {lead.email}
            </a>
          )}
          {lead.phone && (
            <a href={`openphone://dial?number=${encodeURIComponent(lead.phone)}&action=call`} className="block text-sm text-secondary-500 hover:text-primary-500 hover:underline">
              {lead.phone}
            </a>
          )}
          {lead.address && (
            <div className="text-sm text-secondary-400 truncate max-w-[200px]" title={lead.address}>
              {lead.address}
            </div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-secondary-600">
            {formatServiceType(lead.service_type)}
          </div>
        </td>
        <td className="px-6 py-4">
          <button
            onClick={(e) => handleFieldClick('condition', e)}
            className="hover:ring-2 hover:ring-secondary-300 rounded-full transition-all"
          >
            <LeadConditionBadge condition={lead.condition} />
          </button>
        </td>
        <td className="px-6 py-4">
          {photos.length > 0 ? (
            <div className="flex items-center gap-1">
              {photos.slice(0, 3).map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(idx)
                  }}
                  className="w-8 h-8 rounded overflow-hidden bg-secondary-100 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={getPhotoUrl(photo.storage_path)}
                    alt={photo.original_filename || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {photos.length > 3 && (
                <span className="text-xs text-secondary-500 ml-1">
                  +{photos.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-secondary-400">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <button
            onClick={(e) => handleFieldClick('status', e)}
            className="hover:ring-2 hover:ring-secondary-300 rounded-full transition-all"
          >
            <LeadStatusBadge status={lead.status} />
          </button>
        </td>
        <td className="px-6 py-4">
          <button
            onClick={(e) => handleFieldClick('language', e)}
            className="hover:ring-2 hover:ring-secondary-300 rounded-full transition-all"
          >
            <LeadLanguageBadge language={lead.customer?.language ?? 'en'} />
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-secondary-500">
            {createdAt.date}
          </div>
          <div className="text-xs text-secondary-400">
            {createdAt.time}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleToggleDropdown}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {actionsOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
              <div
                ref={dropdownRef}
                className="fixed w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50"
                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction('ask_for_pictures')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ask for Pictures
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction('in_person_estimate')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  In-Person Estimate
                </button>
              </div>,
              document.body
            )}
          </div>
        </td>
      </motion.tr>

      {/* Inline Field Editing Dropdown */}
      {editingField && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          ref={fieldDropdownRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50 max-h-64 overflow-y-auto"
          style={{ top: fieldDropdownPosition.top, left: fieldDropdownPosition.left }}
        >
          {editingField === 'status' && LEAD_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(status.value)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                lead.status === status.value ? 'bg-secondary-100 font-medium' : 'text-secondary-700'
              }`}
            >
              {status.label}
            </button>
          ))}
          {editingField === 'condition' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleConditionChange(null)
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                  lead.condition === null ? 'bg-secondary-100 font-medium' : 'text-secondary-700'
                }`}
              >
                None
              </button>
              {LEAD_CONDITIONS.map((condition) => (
                <button
                  key={condition.value}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleConditionChange(condition.value)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                    lead.condition === condition.value ? 'bg-secondary-100 font-medium' : 'text-secondary-700'
                  }`}
                >
                  {condition.label}
                </button>
              ))}
            </>
          )}
          {editingField === 'language' && LEAD_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={(e) => {
                e.stopPropagation()
                handleLanguageChange(lang.value)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                lead.customer?.language === lang.value ? 'bg-secondary-100 font-medium' : 'text-secondary-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && photos.length > 0 && (
          <PhotoLightbox
            photos={photos}
            selectedIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null))}
            onNext={() => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null))}
            onSelectIndex={(index) => setLightboxIndex(index)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
