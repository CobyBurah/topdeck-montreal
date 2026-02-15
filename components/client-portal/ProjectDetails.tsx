'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

interface Invoice {
  id: string
  created_at: string
  service: string | null
  price: number | null
  status: string
  invoice_link: string | null
}

interface ProjectDetailsProps {
  invoices: Invoice[]
}

const invoiceStatusColors: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  partially_paid: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-secondary-100 text-secondary-600',
  refunded: 'bg-purple-100 text-purple-700',
}

export function ProjectDetails({ invoices }: ProjectDetailsProps) {
  const t = useTranslations('clientPortal')

  if (invoices.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Invoices */}
      {invoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            {t('invoiceCard.title')}
          </h3>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary-50 rounded-xl"
              >
                <div className="space-y-1">
                  {invoice.service && (
                    <p className="text-sm">
                      <span className="text-secondary-500">{t('invoiceCard.service')}:</span>{' '}
                      <span className="font-medium text-secondary-900">{invoice.service}</span>
                    </p>
                  )}
                  {invoice.price != null && (
                    <p className="text-sm">
                      <span className="text-secondary-500">{t('invoiceCard.price')}:</span>{' '}
                      <span className="font-medium text-secondary-900">
                        ${invoice.price.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">{t('invoiceCard.status')}:</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      invoiceStatusColors[invoice.status] || 'bg-secondary-100 text-secondary-600'
                    }`}>
                      {t(`invoiceStatuses.${invoice.status}`)}
                    </span>
                  </div>
                </div>
                {invoice.invoice_link && (
                  <Button
                    href={invoice.invoice_link}
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('invoiceCard.viewInvoice')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
