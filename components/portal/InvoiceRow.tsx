'use client'

import { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { LastInteractionBadge } from './LastInteractionBadge'
import { createClient } from '@/lib/supabase/client'
import type { Invoice, InvoiceStatus } from '@/types/invoice'
import { INVOICE_STATUSES } from '@/types/invoice'

interface InvoiceRowProps {
  invoice: Invoice
  lastInteractionAt?: string | null
  onEdit: () => void
  onUpdate: (invoice: Invoice) => void
}

const statusBorderColors: Record<InvoiceStatus, string> = {
  unpaid: 'border-l-amber-500',
  deposit_paid: 'border-l-blue-500',
  fully_paid: 'border-l-green-500',
}

const statusStyles: Record<InvoiceStatus, string> = {
  unpaid: 'bg-amber-100 text-amber-700',
  deposit_paid: 'bg-blue-100 text-blue-700',
  fully_paid: 'bg-green-100 text-green-700',
}

const statusLabels: Record<InvoiceStatus, string> = {
  unpaid: 'Unpaid',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
}

export function InvoiceRow({ invoice, lastInteractionAt, onEdit, onUpdate }: InvoiceRowProps) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [showCallConfirm, setShowCallConfirm] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [editingStatus, setEditingStatus] = useState(false)
  const [statusDropdownPosition, setStatusDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
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
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(target)
      ) {
        setEditingStatus(false)
      }
    }

    if (actionsOpen || editingStatus) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [actionsOpen, editingStatus])

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

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setStatusDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    })
    setEditingStatus(true)
  }

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setEditingStatus(false)
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id)
      .select('*, customer:customers(id, full_name, email, phone, language)')
      .single()

    if (!error && data) {
      onUpdate(data as Invoice)
    }
  }

  const handleAction = (action: string) => {
    console.log(`Action: ${action} for invoice ${invoice.id}`)
    setActionsOpen(false)
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

  const formatPrice = (price: number | null) => {
    if (price === null) return '-'
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price)
  }

  const formatService = (service: string | null) => {
    if (!service) return '-'
    const labels: Record<string, string> = {
      deck: 'Deck',
      fence: 'Fence',
      pergola: 'Pergola/Gazebo',
      multiple: 'Multiple Surfaces',
      other: 'Other',
    }
    return labels[service] || service
  }

  const createdAt = formatDate(invoice.created_at)
  const customer = invoice.customer

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onEdit}
        className={`hover:bg-secondary-50 transition-colors cursor-pointer border-l-4 ${statusBorderColors[invoice.status]}`}
      >
        {/* Name Column */}
        <td className="px-6 py-4">
          <Link
            href={`/${locale}/employee-portal/customers/${invoice.customer_id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            {customer?.full_name || 'Unknown Customer'}
          </Link>
          <LastInteractionBadge lastInteractionAt={lastInteractionAt} />
        </td>

        {/* Contact Column */}
        <td className="px-6 py-4">
          {/* Mobile: Icon buttons only */}
          <div className="flex items-center gap-2 md:hidden">
            {customer?.phone && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCallConfirm(!showCallConfirm)
                  }}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title={customer.phone}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                {showCallConfirm && (
                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-white rounded-lg shadow-lg border border-secondary-200 z-50 min-w-[180px]">
                    <p className="text-sm text-secondary-600 mb-2">Call {customer.phone}?</p>
                    <div className="flex gap-2">
                      <a
                        href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCallConfirm(false)
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Call
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCallConfirm(false)
                        }}
                        className="px-3 py-1 bg-secondary-200 text-secondary-700 text-sm rounded-lg hover:bg-secondary-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {customer?.email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(customer.email)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title={customer.email}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            )}
          </div>
          {/* Desktop: Full text links */}
          <div className="hidden md:block">
            {customer?.email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(customer.email)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block text-sm text-secondary-600 hover:text-primary-500 hover:underline"
              >
                {customer.email}
              </a>
            )}
            {customer?.phone && (
              <a
                href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`}
                onClick={(e) => e.stopPropagation()}
                className="block text-sm text-secondary-500 hover:text-primary-500 hover:underline"
              >
                {customer.phone}
              </a>
            )}
          </div>
        </td>

        {/* Service Column */}
        <td className="px-6 py-4">
          <div className="text-sm text-secondary-600">
            {formatService(invoice.service)}
          </div>
        </td>

        {/* Price Column */}
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-secondary-900">
            {formatPrice(invoice.price)}
          </div>
        </td>

        {/* Status Column */}
        <td className="px-6 py-4">
          <button
            onClick={handleStatusClick}
            className="hover:ring-2 hover:ring-secondary-300 rounded-full transition-all"
          >
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[invoice.status]}`}
            >
              {statusLabels[invoice.status]}
            </span>
          </button>
        </td>

        {/* Language Column */}
        <td className="px-6 py-4">
          <LeadLanguageBadge language={customer?.language ?? 'en'} />
        </td>

        {/* Created Column */}
        <td className="px-6 py-4">
          <div className="text-sm text-secondary-500">
            {createdAt.date}
          </div>
          <div className="text-xs text-secondary-400">
            {createdAt.time}
          </div>
        </td>

        {/* Actions Column */}
        <td className="px-6 py-4">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleToggleDropdown}
              className="px-3 py-1.5 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
            >
              Actions
            </button>

            {actionsOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
              <div
                ref={dropdownRef}
                className="fixed w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50"
                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              >
                {invoice.invoice_link && (
                  <a
                    href={invoice.invoice_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View in Square
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction('view_details')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction('send_followup')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Follow-up
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction('delete')
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>,
              document.body
            )}
          </div>
        </td>
      </motion.tr>

      {/* Inline Status Editing Dropdown */}
      {editingStatus && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          ref={statusDropdownRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50 max-h-64 overflow-y-auto"
          style={{ top: statusDropdownPosition.top, left: statusDropdownPosition.left }}
        >
          {INVOICE_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(status.value)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary-50 flex items-center gap-2 ${
                invoice.status === status.value ? 'bg-secondary-100 font-medium' : 'text-secondary-700'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
