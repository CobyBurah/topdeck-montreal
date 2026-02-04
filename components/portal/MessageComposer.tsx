'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CustomerSelector } from './CustomerSelector'
import type { Customer } from '@/types/customer'

interface MessageComposerProps {
  customer: Customer | null
  mode: 'email' | 'sms'
  onClose: () => void
  onSent: () => void
  replyTo?: { emailId: string; subject: string }
  showCustomerSelector?: boolean
  onCustomerChange?: (customer: Customer | null) => void
}

export function MessageComposer({
  customer,
  mode,
  onClose,
  onSent,
  replyTo,
  showCustomerSelector = false,
  onCustomerChange,
}: MessageComposerProps) {
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset subject when replyTo changes
  useEffect(() => {
    if (replyTo) {
      setSubject(`Re: ${replyTo.subject}`)
    }
  }, [replyTo])

  const recipient = customer ? (mode === 'email' ? customer.email : customer.phone) : null
  const maxSmsLength = 160
  const isReply = !!replyTo

  const handleSend = async () => {
    // Validate
    if (!customer) {
      setError('Please select a customer')
      return
    }
    if (mode === 'email' && !subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!message.trim()) {
      setError('Message is required')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          type: mode,
          subject: mode === 'email' ? subject : undefined,
          message,
          reply_to_id: replyTo?.emailId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white border border-secondary-200 rounded-xl shadow-lg h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200">
        <div className="flex items-center gap-2">
          {mode === 'email' ? (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
          <h3 className="font-semibold text-secondary-900">
            {mode === 'email' ? 'Send Email' : 'Send Text Message'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Recipient */}
        {showCustomerSelector ? (
          <CustomerSelector
            selectedCustomer={customer}
            onSelect={(c) => onCustomerChange?.(c)}
            filterByEmail={mode === 'email'}
            filterByPhone={mode === 'sms'}
            placeholder={mode === 'email' ? 'Search for a customer with email...' : 'Search for a customer with phone...'}
          />
        ) : customer ? (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              To
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg">
              <span className="text-secondary-900">{customer.full_name}</span>
              <span className="text-secondary-500">&lt;{recipient}&gt;</span>
            </div>
          </div>
        ) : null}

        {/* Subject (email only) */}
        {mode === 'email' && (
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            disabled={isReply}
          />
        )}

        {/* Message */}
        <div>
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={mode === 'email' ? 'Write your email message...' : 'Write your text message...'}
            rows={mode === 'email' ? 8 : 4}
          />
          {mode === 'sms' && (
            <div className={`text-sm mt-1 ${message.length > maxSmsLength ? 'text-amber-600' : 'text-secondary-500'}`}>
              {message.length} / {maxSmsLength} characters
              {message.length > maxSmsLength && ' (will be sent as multiple messages)'}
            </div>
          )}
        </div>

        {/* Error */}
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
      <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-secondary-200">
        <Button variant="ghost" onClick={onClose} disabled={isSending}>
          Cancel
        </Button>
        <Button onClick={handleSend} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </motion.div>
  )
}
