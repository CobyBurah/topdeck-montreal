'use client'

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
          <a href={`openphone://dial?number=${encodeURIComponent(customer.phone)}&action=call`} className="block text-sm text-secondary-500 hover:text-primary-500 hover:underline">
            {customer.phone}
          </a>
        )}
        {customer.address && (
          <div className="text-sm text-secondary-400 truncate max-w-[200px]" title={customer.address}>
            {customer.address}
          </div>
        )}
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
