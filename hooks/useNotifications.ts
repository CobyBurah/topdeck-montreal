import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from 'next-intl'
import type { PortalNotification } from '@/types/notification'
import type { RealtimeChannel } from '@supabase/supabase-js'

const DISMISSED_KEY = 'portal-dismissed-notifications'

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveDismissedIds(ids: Set<string>): void {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)))
}

export function useNotifications() {
  const locale = useLocale()
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    setDismissedIds(getDismissedIds())
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/employee-portal/notifications')
      if (res.ok) {
        const data: PortalNotification[] = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced fetch to avoid hammering API on rapid realtime events
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const debouncedFetch = useMemo(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(fetchNotifications, 500)
    }
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Subscribe to realtime changes on all relevant tables
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sms_logs' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, debouncedFetch)
      .subscribe()

    channelRef.current = channel

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      supabase.removeChannel(channel)
    }
  }, [debouncedFetch])

  const dismiss = useCallback((notificationId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(notificationId)
      saveDismissedIds(next)
      return next
    })
  }, [])

  // Clean up stale dismissed IDs that no longer appear in notifications
  useEffect(() => {
    if (notifications.length === 0) return
    const activeIds = new Set(notifications.map((n) => n.id))
    setDismissedIds((prev) => {
      const cleaned = new Set(Array.from(prev).filter((id) => activeIds.has(id)))
      if (cleaned.size !== prev.size) {
        saveDismissedIds(cleaned)
      }
      return cleaned
    })
  }, [notifications])

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id))
  const unreadCount = visibleNotifications.length

  const getNotificationHref = useCallback(
    (notification: PortalNotification) => `/${locale}${notification.href}`,
    [locale]
  )

  return {
    notifications: visibleNotifications,
    unreadCount,
    isLoading,
    dismiss,
    getNotificationHref,
    refetch: fetchNotifications,
  }
}
