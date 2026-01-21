'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { LeadLanguageBadge } from './LeadLanguageBadge'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types/customer'

interface CustomerRowProps {
  customer: Customer
  onEdit: () => void
}

export function CustomerRow({ customer, onEdit }: CustomerRowProps) {
  const router = useRouter()
  const locale = useLocale()
  const [showCallConfirm, setShowCallConfirm] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleViewProfile = () => {
    router.push(`/${locale}/portal/customers/${customer.id}`)
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-secondary-50 transition-colors cursor-pointer"
      onClick={handleViewProfile}
    >
      <td className="px-6 py-4">
        <div className="font-medium text-secondary-900">{customer.full_name}</div>
      </td>
      <td className="px-6 py-4">
        {/* Mobile: Icon buttons only */}
        <div className="flex items-center gap-2 md:hidden">
          {customer.phone && (
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
          {customer.email && (
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
          {customer.address && (
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(customer.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
              title={customer.address}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          )}
        </div>
        {/* Desktop: Full text links */}
        <div className="hidden md:block">
          {customer.email && (
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
          {customer.phone && (
            <a
              href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`}
              onClick={(e) => e.stopPropagation()}
              className="block text-sm text-secondary-500 hover:text-primary-500 hover:underline"
            >
              {customer.phone}
            </a>
          )}
          {customer.address && (
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(customer.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block text-sm text-secondary-400 truncate max-w-[200px] hover:text-primary-500 hover:underline"
              title={customer.address}
            >
              {customer.address}
            </a>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-secondary-600">
          {customer.lead_count ?? 0}
        </div>
      </td>
      <td className="px-6 py-4">
        <LeadLanguageBadge language={customer.language} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-secondary-500">
          {formatDate(customer.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewProfile()
            }}
          >
            View
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}
