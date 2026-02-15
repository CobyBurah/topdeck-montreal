'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { InvoiceStatus } from '@/types/invoice'

export type CustomerStage = 'returning' | 'active_lead' | 'has_estimate' | 'unpaid_invoice'

export interface StageContext {
  estimateRelativeTime?: string
  estimateRelativeTimeFr?: string
}

interface UseCustomerStageReturn {
  stage: CustomerStage
  context: StageContext
  isLoading: boolean
}

const UNPAID_STATUSES: InvoiceStatus[] = ['unpaid', 'deposit_paid']

function getRelativeTime(dateString: string): { en: string; fr: string } {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24))

  if (diffDays <= 3) return { en: 'a few days ago', fr: 'il y a quelques jours' }
  if (diffDays <= 9) return { en: 'last week', fr: 'la semaine dernière' }
  if (diffDays <= 20) return { en: 'a couple weeks ago', fr: 'il y a quelques semaines' }
  return { en: 'last month', fr: 'le mois dernier' }
}

export function useCustomerStage(customerId: string | null): UseCustomerStageReturn {
  const [stage, setStage] = useState<CustomerStage>('returning')
  const [context, setContext] = useState<StageContext>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!customerId) {
      setStage('returning')
      setContext({})
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const fetchStage = async () => {
      const supabase = createClient()

      const [invoicesResult, estimatesResult, leadsResult] = await Promise.all([
        supabase
          .from('invoices')
          .select('id, status, created_at')
          .eq('customer_id', customerId)
          .in('status', UNPAID_STATUSES)
          .limit(1),
        supabase
          .from('estimates')
          .select('id, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('leads')
          .select('id, status, created_at')
          .eq('customer_id', customerId)
          .neq('status', 'complete')
          .limit(1),
      ])

      if (invoicesResult.data && invoicesResult.data.length > 0) {
        setStage('unpaid_invoice')
        setContext({})
      } else if (estimatesResult.data && estimatesResult.data.length > 0) {
        const relative = getRelativeTime(estimatesResult.data[0].created_at)
        setStage('has_estimate')
        setContext({
          estimateRelativeTime: relative.en,
          estimateRelativeTimeFr: relative.fr,
        })
      } else if (leadsResult.data && leadsResult.data.length > 0) {
        setStage('active_lead')
        setContext({})
      } else {
        setStage('returning')
        setContext({})
      }

      setIsLoading(false)
    }

    fetchStage()
  }, [customerId])

  return { stage, context, isLoading }
}
