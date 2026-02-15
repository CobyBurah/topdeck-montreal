'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types/customer'

const SIGNATURE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'coby', label: 'Coby' },
  { value: 'max', label: 'Max' },
]

const EMAIL_TO_SIGNATURE: Record<string, string> = {
  'cburah@icloud.com': 'coby',
  'madmax6b@gmail.com': 'max',
}

interface InlineComposerProps {
  customer: Customer
  composerMode: 'email' | 'sms' | null
  onModeChange: (mode: 'email' | 'sms') => void
  replyContext: { emailId: string; subject: string } | null
  onClearReply: () => void
  onSent: () => void
  prefill?: { message: string; subject?: string } | null
  onClearPrefill?: () => void
}

export function InlineComposer({
  customer,
  composerMode,
  onModeChange,
  replyContext,
  onClearReply,
  onSent,
  prefill,
  onClearPrefill,
}: InlineComposerProps) {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [signature, setSignature] = useState('none')
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('08:00')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Set default signature for email mode
  useEffect(() => {
    if (composerMode !== 'email') return
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setSignature(EMAIL_TO_SIGNATURE[user.email] || 'none')
      }
    }
    fetchUser()
  }, [composerMode])

  // Set subject when replying
  useEffect(() => {
    if (replyContext) {
      setSubject(`Re: ${replyContext.subject}`)
      setExpanded(true)
    }
  }, [replyContext])

  // Apply prefilled template
  useEffect(() => {
    if (prefill) {
      setMessage(prefill.message)
      if (prefill.subject) {
        setSubject(prefill.subject)
      }
      setExpanded(true)
      textareaRef.current?.focus()
      onClearPrefill?.()
    }
  }, [prefill, onClearPrefill])

  // Close schedule dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowScheduleDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTomorrowAt8AM = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0)
    return tomorrow
  }, [])

  const getMinDate = useCallback(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  const handleSend = async () => {
    if (!composerMode) return
    if (composerMode === 'email' && !subject.trim()) {
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
      const response = await fetch('/api/employee-portal/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          type: composerMode,
          subject: composerMode === 'email' ? subject : undefined,
          message,
          reply_to_id: replyContext?.emailId,
          signature: composerMode === 'email' ? signature : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setMessage('')
      setSubject('')
      setExpanded(false)
      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleScheduleSend = async (scheduledFor: Date) => {
    if (!composerMode) return
    if (composerMode === 'email' && !subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!message.trim()) {
      setError('Message is required')
      return
    }

    setIsSending(true)
    setError(null)
    setShowScheduleDropdown(false)

    try {
      const response = await fetch('/api/employee-portal/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          type: composerMode,
          subject: composerMode === 'email' ? subject : undefined,
          message,
          reply_to_id: replyContext?.emailId,
          scheduled_time: scheduledFor.toISOString(),
          signature: composerMode === 'email' ? signature : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule message')
      }

      setMessage('')
      setSubject('')
      setExpanded(false)
      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule message')
    } finally {
      setIsSending(false)
    }
  }

  const handleScheduleWithPicker = () => {
    if (!scheduleDate) {
      setError('Please select a date')
      return
    }
    const [hours, minutes] = scheduleTime.split(':').map(Number)
    const scheduledDate = new Date(scheduleDate)
    scheduledDate.setHours(hours, minutes, 0, 0)

    if (scheduledDate <= new Date()) {
      setError('Scheduled time must be in the future')
      return
    }

    handleScheduleSend(scheduledDate)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && composerMode === 'sms') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div>
      {/* Error */}
      {error && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Mode toggle + Reply context */}
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={() => { onModeChange('sms'); setExpanded(true) }}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            composerMode === 'sms'
              ? 'bg-cyan-100 text-cyan-700'
              : 'text-secondary-500 hover:bg-secondary-100'
          )}
        >
          SMS
        </button>
        <button
          onClick={() => { onModeChange('email'); setExpanded(true) }}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            composerMode === 'email'
              ? 'bg-purple-100 text-purple-700'
              : 'text-secondary-500 hover:bg-secondary-100'
          )}
        >
          Email
        </button>

        {replyContext && (
          <div className="flex items-center gap-1 ml-2 text-xs text-secondary-500 min-w-0">
            <span className="truncate">Re: {replyContext.subject}</span>
            <button onClick={onClearReply} className="text-secondary-400 hover:text-secondary-600 shrink-0">
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Subject (email only, expanded) */}
      {composerMode === 'email' && expanded && (
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-3 py-1.5 mb-2 text-sm border border-secondary-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
          disabled={!!replyContext}
        />
      )}

      {/* Signature (email only, expanded) */}
      {composerMode === 'email' && expanded && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-secondary-500">Signature:</span>
          {SIGNATURE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSignature(opt.value)}
              className={cn(
                'px-2 py-0.5 rounded text-xs transition-colors',
                signature === opt.value
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-secondary-500 hover:bg-secondary-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Message input + Send */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => { if (!composerMode) onModeChange('sms'); setExpanded(true) }}
          onKeyDown={handleKeyDown}
          placeholder={composerMode === 'email' ? 'Type an email...' : 'Type a message...'}
          rows={expanded ? 5 : 1}
          className="flex-1 px-3 py-2 text-sm border border-secondary-200 rounded-xl resize-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
        />
        <div className="relative shrink-0" ref={dropdownRef}>
          <div className="flex">
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim() || !composerMode}
              className="p-2.5 bg-primary-500 text-white rounded-l-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
              disabled={isSending}
              className="px-1.5 bg-primary-500 text-white rounded-r-xl border-l border-primary-400 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>

          {showScheduleDropdown && (
            <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-secondary-200 rounded-xl shadow-lg z-50 p-4">
              <h4 className="font-medium text-secondary-900 text-sm mb-3">Schedule send</h4>
              <button
                onClick={() => handleScheduleSend(getTomorrowAt8AM())}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary-50 rounded-lg transition-colors mb-3"
              >
                <ClockIcon className="w-5 h-5 text-secondary-500" />
                <span className="text-sm text-secondary-700">Tomorrow at 8:00 AM</span>
              </button>
              <div className="border-t border-secondary-200 pt-3">
                <p className="text-xs text-secondary-500 mb-2">Pick date & time</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={getMinDate()}
                    className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-24 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleScheduleWithPicker}
                  className="w-full px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMS character count */}
      {composerMode === 'sms' && message.length > 0 && (
        <p className={cn('text-xs mt-1', message.length > 160 ? 'text-amber-600' : 'text-secondary-400')}>
          {message.length}/160
        </p>
      )}
    </div>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
