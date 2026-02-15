'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { LeadDetailPanel } from '@/components/portal/LeadDetailPanel'
import { EstimateDetailPanel } from '@/components/portal/EstimateDetailPanel'
import { InvoiceDetailPanel } from '@/components/portal/InvoiceDetailPanel'
import type { Lead } from '@/types/lead'
import type { Estimate } from '@/types/estimate'
import type { Invoice } from '@/types/invoice'
import type { MapItemType } from '@/components/portal/MapPin'

interface MapDetailPanelProps {
  type: MapItemType
  item: Lead | Estimate | Invoice
  isOpen: boolean
  onClose: () => void
  onUpdate: (item: Lead | Estimate | Invoice) => void
  onDelete?: (id: string) => void
}

const typeConfig: Record<MapItemType, { label: string; route: string; param: string }> = {
  lead: { label: 'Leads', route: 'leads', param: 'leadId' },
  estimate: { label: 'Estimates', route: 'estimates', param: 'estimateId' },
  invoice: { label: 'Invoices', route: 'invoices', param: 'invoiceId' },
}

export function MapDetailPanel({ type, item, isOpen, onClose, onUpdate, onDelete }: MapDetailPanelProps) {
  const locale = useLocale()
  const config = typeConfig[type]
  const href = `/${locale}/employee-portal/${config.route}?${config.param}=${item.id}`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-[420px] max-w-[90vw] bg-white shadow-2xl border-l border-secondary-200 z-20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-secondary-200 bg-secondary-50 flex-shrink-0">
              <Button href={href} variant="outline" size="sm">
                Open in {config.label}
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
                aria-label="Close panel"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Detail content */}
            <div className="flex-1 overflow-y-auto">
              {type === 'lead' && (
                <LeadDetailPanel
                  lead={item as Lead}
                  onUpdate={(updated) => onUpdate(updated)}
                  onDelete={onDelete}
                  onBack={onClose}
                />
              )}
              {type === 'estimate' && (
                <EstimateDetailPanel
                  estimate={item as Estimate}
                  onUpdate={(updated) => onUpdate(updated)}
                  onDelete={onDelete}
                  onBack={onClose}
                />
              )}
              {type === 'invoice' && (
                <InvoiceDetailPanel
                  invoice={item as Invoice}
                  onUpdate={(updated) => onUpdate(updated)}
                  onDelete={onDelete}
                  onBack={onClose}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
