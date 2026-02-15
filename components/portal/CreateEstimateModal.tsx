'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { Lead } from '@/types/lead'

const SQUARE_ESTIMATES_URL = 'https://app.squareup.com/dashboard/invoices/estimates/new'

function generateEstimateTemplate(
  clientPortalUrl: string,
  language: 'en' | 'fr',
  hasStainChoices: boolean
): string {
  if (language === 'fr') {
    const firstLine = hasStainChoices
      ? `Suivez votre projet : ${clientPortalUrl}`
      : `Suivez votre projet et explorez les options de teinture : ${clientPortalUrl}`

    return `${firstLine}

Détails
- Un dépôt de 20 % est requis pour réserver votre place
- Le solde doit être payé à la fin des travaux

Teinture
- Le prix de la teinture n'est pas inclus
- Le choix de teinture doit être approuvé par Topdeck
- L'ancienne teinture pourrait ne pas être complètement enlevée

Au plaisir de travailler avec vous !

RBQ : 5845-6906-01`
  }

  const firstLine = hasStainChoices
    ? `Track your project: ${clientPortalUrl}`
    : `Track your project and explore stain options: ${clientPortalUrl}`

  return `${firstLine}

Details
- 20% deposit required to reserve your place
- Balance to be paid upon completion

Stain
- Price of stain is not included
- Stain selection must be approved by Topdeck
- Old stain may not be completely removed

We look forward to working with you!

RBQ: 5845-6906-01`
}

interface CreateEstimateModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
}

export function CreateEstimateModal({ lead, isOpen, onClose }: CreateEstimateModalProps) {
  const [copied, setCopied] = useState(false)

  const language = (lead.customer?.language ?? lead.language ?? 'en') as 'en' | 'fr'
  const hasStainChoices = Array.isArray(lead.stain_choices) && lead.stain_choices.length > 0
  const clientPortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${language}/client-portal`
    : `/${language}/client-portal`
  const templateText = generateEstimateTemplate(clientPortalUrl, language, hasStainChoices)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(templateText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Create Estimate</h2>
              <button
                onClick={onClose}
                className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Square Link */}
              <a
                href={SQUARE_ESTIMATES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Create Estimate on Square
              </a>

              {/* Template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-secondary-700">
                    Estimate Notes Template ({language === 'fr' ? 'French' : 'English'})
                  </p>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 text-sm text-secondary-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {templateText}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-secondary-200">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
