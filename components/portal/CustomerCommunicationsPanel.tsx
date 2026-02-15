'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CommunicationTimeline } from './CommunicationTimeline'
import { InlineComposer } from './InlineComposer'
import { QuickTemplateBubbles } from './QuickTemplateBubbles'
import { useCustomerStage } from '@/hooks/useCustomerStage'
import type { Customer } from '@/types/customer'
import type { TimelineItem } from '@/types/communication'

interface CustomerCommunicationsPanelProps {
  customer: Customer
  timeline: TimelineItem[]
  isLoading: boolean
  onBack?: () => void
}

export function CustomerCommunicationsPanel({
  customer,
  timeline,
  isLoading,
  onBack,
}: CustomerCommunicationsPanelProps) {
  const [composerMode, setComposerMode] = useState<'email' | 'sms' | null>('sms')
  const [replyContext, setReplyContext] = useState<{ emailId: string; subject: string } | null>(null)
  const [prefill, setPrefill] = useState<{ message: string; subject?: string } | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const { stage, context: stageContext, isLoading: isStageLoading } = useCustomerStage(customer.id)

  // Auto-scroll to bottom when timeline loads or new items arrive
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [timeline, isLoading])

  const handleReply = useCallback((emailId: string, subject: string) => {
    setReplyContext({ emailId, subject })
    setComposerMode('email')
  }, [])

  const handleSent = useCallback(() => {
    setReplyContext(null)
  }, [])

  const handleTemplateSelect = useCallback((template: { message: string; subject?: string }) => {
    setPrefill(template)
    if (!composerMode) {
      setComposerMode('sms')
    }
  }, [composerMode])

  const handleCancelScheduled = useCallback(async (scheduledId: string) => {
    try {
      const response = await fetch(
        `/api/employee-portal/communications/scheduled/${scheduledId}`,
        { method: 'DELETE' }
      )
      if (!response.ok) {
        console.error('Failed to cancel scheduled message')
      }
    } catch (error) {
      console.error('Failed to cancel scheduled message:', error)
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Mobile back button only */}
      {onBack && (
        <div className="px-4 py-3 border-b border-secondary-200 shrink-0 lg:hidden">
          <button
            onClick={onBack}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-52">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-secondary-200 rounded w-24 mb-2" />
                <div className="h-16 bg-secondary-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <CommunicationTimeline
            items={timeline}
            onReply={(emailId, subject) => handleReply(emailId, subject)}
            onCancelScheduled={handleCancelScheduled}
          />
        )}
      </div>

      {/* Fixed-bottom inline composer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-secondary-200 bg-white p-3">
        <QuickTemplateBubbles
          stage={stage}
          stageContext={stageContext}
          customerName={customer.full_name}
          customerLanguage={customer.language}
          isLoading={isStageLoading}
          onSelect={handleTemplateSelect}
        />
        <InlineComposer
          customer={customer}
          composerMode={composerMode}
          onModeChange={setComposerMode}
          replyContext={replyContext}
          onClearReply={() => setReplyContext(null)}
          onSent={handleSent}
          prefill={prefill}
          onClearPrefill={() => setPrefill(null)}
        />
      </div>
    </div>
  )
}
