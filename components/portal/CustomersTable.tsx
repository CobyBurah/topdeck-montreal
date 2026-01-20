'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CustomerRow } from './CustomerRow'
import { CustomerModal } from './CustomerModal'
import { CustomerFilters } from './CustomerFilters'
import { Button } from '@/components/ui/Button'
import type { Customer } from '@/types/customer'

interface CustomersTableProps {
  initialCustomers: Customer[]
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'created_at' | 'full_name'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          customer.full_name.toLowerCase().includes(searchLower) ||
          (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
          (customer.phone?.toLowerCase().includes(searchLower) ?? false)
        )
      })
      .sort((a, b) => {
        const aVal = a[sortField] ?? ''
        const bVal = b[sortField] ?? ''
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : 1
        }
        return aVal > bVal ? -1 : 1
      })
  }, [customers, searchQuery, sortField, sortDirection])

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    )
  }

  const handleCustomerCreate = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev])
  }

  const handleCustomerDelete = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId))
  }

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  const openAddModal = () => {
    setSelectedCustomer(null)
    setIsAddingNew(true)
    setIsModalOpen(true)
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsAddingNew(false)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <CustomerFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <Button onClick={openAddModal}>
          + Add Customer
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('full_name')}
                >
                  Name
                  <SortIcon field="full_name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Leads
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">
                  Lang
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-secondary-700 cursor-pointer hover:bg-secondary-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  Created
                  <SortIcon field="created_at" />
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              <AnimatePresence>
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onEdit={() => openEditModal(customer)}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="py-12 text-center text-secondary-500">
            {searchQuery ? 'No customers match your search' : 'No customers yet'}
          </div>
        )}
      </div>

      <CustomerModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        isNew={isAddingNew}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCustomer(null)
          setIsAddingNew(false)
        }}
        onUpdate={handleCustomerUpdate}
        onCreate={handleCustomerCreate}
        onDelete={handleCustomerDelete}
      />
    </div>
  )
}
