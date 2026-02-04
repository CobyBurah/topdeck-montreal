'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types/customer'

interface CustomerMergeModalProps {
  sourceCustomer: Customer
  isOpen: boolean
  onClose: () => void
  onMergeComplete: (mergedCustomer: Customer) => void
}

interface RecordCounts {
  leads: number
  estimates: number
  invoices: number
  emails: number
  sms: number
  calls: number
  activities: number
}

export function CustomerMergeModal({
  sourceCustomer,
  isOpen,
  onClose,
  onMergeComplete
}: CustomerMergeModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceCounts, setSourceCounts] = useState<RecordCounts | null>(null)

  // Fetch all customers except source
  useEffect(() => {
    if (!isOpen) return

    const fetchCustomers = async () => {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .neq('id', sourceCustomer.id)
        .order('full_name')

      setIsLoading(false)

      if (fetchError) {
        setError('Failed to load customers')
        console.error('Error fetching customers:', fetchError)
        return
      }

      setCustomers(data || [])
    }

    fetchCustomers()
  }, [isOpen, sourceCustomer.id])

  // Fetch record counts for source customer
  useEffect(() => {
    if (!isOpen) return

    const fetchCounts = async () => {
      const supabase = createClient()

      const [leads, estimates, invoices, emails, sms, calls, activities] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('estimates').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('email_logs').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('sms_logs').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('call_logs').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).eq('customer_id', sourceCustomer.id),
      ])

      setSourceCounts({
        leads: leads.count ?? 0,
        estimates: estimates.count ?? 0,
        invoices: invoices.count ?? 0,
        emails: emails.count ?? 0,
        sms: sms.count ?? 0,
        calls: calls.count ?? 0,
        activities: activities.count ?? 0,
      })
    }

    fetchCounts()
  }, [isOpen, sourceCustomer.id])

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers

    const query = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
    )
  }, [customers, searchQuery])

  const handleMerge = async () => {
    if (!selectedTarget) return

    setIsMerging(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/customers/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCustomerId: sourceCustomer.id,
          targetCustomerId: selectedTarget.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to merge customers')
      }

      onMergeComplete(data.mergedCustomer)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge customers')
    } finally {
      setIsMerging(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedTarget(null)
    setError(null)
    onClose()
  }

  const totalRecordsToTransfer = sourceCounts
    ? sourceCounts.leads +
      sourceCounts.estimates +
      sourceCounts.invoices +
      sourceCounts.emails +
      sourceCounts.sms +
      sourceCounts.calls +
      sourceCounts.activities
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-secondary-900">Merge Customer</h2>
                <p className="text-sm text-secondary-500">
                  Select a customer to merge &quot;{sourceCustomer.full_name}&quot; into
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Customer List */}
              <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-secondary-200">
                <div className="p-4 border-b border-secondary-100">
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-secondary-500">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center text-secondary-500">
                      {searchQuery ? 'No customers match your search' : 'No other customers found'}
                    </div>
                  ) : (
                    <div className="divide-y divide-secondary-100">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => setSelectedTarget(customer)}
                          className={`w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors ${
                            selectedTarget?.id === customer.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                          }`}
                        >
                          <div className="font-medium text-secondary-900">{customer.full_name}</div>
                          <div className="text-sm text-secondary-500 space-x-3">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-full md:w-80 p-4 bg-secondary-50 overflow-y-auto">
                {selectedTarget ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-secondary-900">Merge Preview</h3>

                    {/* Field Comparison */}
                    <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                      <div className="font-medium text-secondary-700 mb-2">Resulting Fields:</div>
                      <FieldPreview label="Name" source={sourceCustomer.full_name} target={selectedTarget.full_name} />
                      <FieldPreview label="Email" source={sourceCustomer.email} target={selectedTarget.email} />
                      <FieldPreview label="Phone" source={sourceCustomer.phone} target={selectedTarget.phone} />
                      <FieldPreview label="Address" source={sourceCustomer.address} target={selectedTarget.address} />
                    </div>

                    {/* Records to Transfer */}
                    {sourceCounts && totalRecordsToTransfer > 0 && (
                      <div className="bg-white rounded-lg p-3 text-sm">
                        <div className="font-medium text-secondary-700 mb-2">Records to Transfer:</div>
                        <ul className="space-y-1 text-secondary-600">
                          {sourceCounts.leads > 0 && <li>{sourceCounts.leads} lead{sourceCounts.leads !== 1 ? 's' : ''}</li>}
                          {sourceCounts.estimates > 0 && <li>{sourceCounts.estimates} estimate{sourceCounts.estimates !== 1 ? 's' : ''}</li>}
                          {sourceCounts.invoices > 0 && <li>{sourceCounts.invoices} invoice{sourceCounts.invoices !== 1 ? 's' : ''}</li>}
                          {sourceCounts.emails > 0 && <li>{sourceCounts.emails} email{sourceCounts.emails !== 1 ? 's' : ''}</li>}
                          {sourceCounts.sms > 0 && <li>{sourceCounts.sms} SMS message{sourceCounts.sms !== 1 ? 's' : ''}</li>}
                          {sourceCounts.calls > 0 && <li>{sourceCounts.calls} call{sourceCounts.calls !== 1 ? 's' : ''}</li>}
                          {sourceCounts.activities > 0 && <li>{sourceCounts.activities} activit{sourceCounts.activities !== 1 ? 'ies' : 'y'}</li>}
                        </ul>
                      </div>
                    )}

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      <strong>Warning:</strong> This action cannot be undone. &quot;{sourceCustomer.full_name}&quot; will be permanently deleted.
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <p>Select a customer to see merge preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-secondary-200 shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleMerge}
                disabled={!selectedTarget || isMerging}
              >
                {isMerging ? 'Merging...' : 'Merge Customers'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper component for field preview
function FieldPreview({
  label,
  source,
  target,
}: {
  label: string
  source: string | null | undefined
  target: string | null | undefined
}) {
  const resultValue = target || source || '-'
  const isFromSource = !target && source

  return (
    <div className="flex justify-between items-center">
      <span className="text-secondary-500">{label}:</span>
      <span className={`font-medium ${isFromSource ? 'text-primary-600' : 'text-secondary-900'}`}>
        {resultValue}
        {isFromSource && <span className="text-xs ml-1">(from source)</span>}
      </span>
    </div>
  )
}
