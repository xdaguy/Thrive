'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, DollarSign, Trash2, Edit, Calendar, TrendingUp, Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/constants'
import { db, generateId, type Debt } from '@/lib/db/schema'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { haptics } from '@/lib/haptics'
import { useSwipeToDelete } from '@/hooks/use-swipe'
import { useSearchFilter } from '@/hooks/use-search-filter'
import { useSettings } from '@/hooks/use-settings'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { useMinimumLoadingTime } from '@/hooks/use-minimum-loading'
import { SearchBar } from '@/components/ui/search-bar'
import { QuickFilters } from '@/components/ui/quick-filters'
import { SortButton } from '@/components/ui/sort-button'
import { ExportButton } from '@/components/ui/export-button'
import { exportDebtToCSV } from '@/lib/export'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MIN_LOADING_TIME_MS, MAX_AMOUNT_VALIDATION } from '@/lib/constants'

interface DebtTabProps {
  openForm?: boolean
}

// Swipeable Debt Item Wrapper
interface SwipeableDebtItemProps {
  debt: Debt
  currency: string
  dateFormat: string
  onEdit: (debt: Debt) => void
  onDelete: (id: string) => void
  onMarkAsPaid: (id: string) => void
}

function SwipeableDebtItem({ debt, currency, dateFormat, onEdit, onDelete, onMarkAsPaid }: SwipeableDebtItemProps) {
  const { swipeHandlers, swipeStyle } = useSwipeToDelete(() => {
    onDelete(debt.id!)
  })

  const remaining = debt.amount - debt.paidAmount
  const isPaid = debt.status === 'paid'
  const isOwedToMe = debt.type === 'owed_to_me'

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1A]">
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 dark:bg-red-600 flex items-center justify-end px-6">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Main Content */}
      <div
        {...swipeHandlers}
        style={swipeStyle}
        className={`relative p-4 bg-white dark:bg-[#1A1A1A] hover:shadow-md transition-shadow ${
          isPaid ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isPaid
                ? 'bg-gray-200 dark:bg-gray-800'
                : isOwedToMe
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {isPaid ? (
                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <AlertCircle className={`w-5 h-5 ${
                  isOwedToMe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">{debt.person}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                  isOwedToMe
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {isOwedToMe ? 'Owed to me' : 'I owe'}
                </span>
                {isPaid && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    Paid
                  </span>
                )}
                {debt.interestRate > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {debt.interestRate}% interest
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className={`text-xl font-bold flex-shrink-0 ${
            isPaid
              ? 'text-gray-600 dark:text-gray-400 line-through'
              : isOwedToMe
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(remaining, currency)}
          </p>
        </div>
        <div className="pl-[52px] flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
            {formatDate(debt.dueDate, dateFormat)}
            {debt.description && ` • ${debt.description}`}
            {!isPaid && debt.paidAmount > 0 && ` • ${formatCurrency(debt.paidAmount, currency)}/${formatCurrency(debt.amount, currency)}`}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            {!isPaid && (
              <>
                <button
                  onClick={() => onEdit(debt)}
                  className="btn-icon text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  aria-label={`Edit debt with ${debt.person}`}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onMarkAsPaid(debt.id!)}
                  className="btn-icon text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  aria-label={`Mark debt with ${debt.person} as paid`}
                  title="Mark as paid"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(debt.id!)}
              className="btn-icon text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label={`Delete debt with ${debt.person}`}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DebtTab({ openForm }: DebtTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const { currency, dateFormat } = useSettings()
  const { handleError } = useErrorHandler()
  const { ensureMinimumTime } = useMinimumLoadingTime()
  const [debts, setDebts] = useState<Debt[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'i_owe' as 'owed_to_me' | 'i_owe',
    person: '',
    amount: '',
    paidAmount: '',
    dueDate: '',
    interestRate: '',
    description: ''
  })

  // Search and filter
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filters,
    filteredItems: filteredDebts,
    hasActiveFilters,
    handleSort,
    updateFilters,
    resetFilters
  } = useSearchFilter(debts, {
    searchFields: ['person', 'description', 'type', 'status'],
    sortableFields: ['dueDate', 'amount', 'person', 'status'],
    defaultSortField: 'dueDate',
    defaultSortDirection: 'asc'
  })

  useEffect(() => {
    loadDebts()
  }, [])

  useEffect(() => {
    // Auto-open form when openForm prop is true
    if (openForm) {
      setShowForm(true)
    }
  }, [openForm])

  async function loadDebts() {
    try {
      setLoading(true)
      const data = await ensureMinimumTime(
        db.debts.orderBy('createdAt').reverse().toArray(),
        MIN_LOADING_TIME_MS
      )
      setDebts(data)
    } catch (error) {
      handleError(error, 'Failed to load debt entries')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    haptics.light()
    
    // Validation
    const amount = parseFloat(formData.amount)
    const paidAmount = formData.paidAmount ? parseFloat(formData.paidAmount) : 0
    const interestRate = formData.interestRate ? parseFloat(formData.interestRate) : 0
    
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      haptics.error()
      return
    }
    if (amount > MAX_AMOUNT_VALIDATION) {
      toast.error('Amount seems unrealistically high. Please check.')
      return
    }
    if (paidAmount < 0 || paidAmount > amount) {
      toast.error('Paid amount must be between 0 and total amount')
      return
    }
    if (interestRate < 0 || interestRate > 100) {
      toast.error('Interest rate must be between 0 and 100%')
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
    const debtData = {
      type: formData.type,
      person: formData.person,
      amount,
      paidAmount,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
      interestRate,
      description: formData.description,
      status: paidAmount >= amount ? 'paid' : 'active' as 'active' | 'paid',
      updatedAt: new Date()
    }
    
    try {
      if (editingId) {
        // OPTIMISTIC UPDATE
        const optimisticDebt = {
          ...debtData,
          id: editingId,
          createdAt: new Date()
        }
        setDebts(prev => prev.map(d => d.id === editingId ? optimisticDebt : d))
        setEditingId(null)
        setShowForm(false)
        await db.debts.update(editingId, debtData)
      } else {
        // OPTIMISTIC ADD
        const tempId = `temp-${Date.now()}`
        const optimisticDebt = {
          ...debtData,
          id: tempId,
          createdAt: new Date()
        }
        setDebts(prev => [optimisticDebt, ...prev])
        setShowForm(false)
        const realId = generateId()
        await db.debts.add({
          ...debtData,
          id: realId,
          createdAt: new Date()
        })
        setDebts(prev => {
          const withoutTemp = prev.filter(d => d.id !== tempId)
          const withReal = { ...optimisticDebt, id: realId }
          return [withReal, ...withoutTemp]
        })
      }

      setFormData({
        type: 'i_owe',
        person: '',
        amount: '',
        paidAmount: '',
        dueDate: '',
        interestRate: '',
        description: ''
      })
      
      DataEvents.emit(DATA_EVENTS.DEBT_CHANGED)
      haptics.success()
    } catch (error) {
      handleError(error, 'Failed to save debt entry')
      loadDebts()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(debt: Debt) {
    haptics.light()
    setEditingId(debt.id!)
    setFormData({
      type: debt.type,
      person: debt.person,
      amount: debt.amount.toString(),
      paidAmount: debt.paidAmount.toString(),
      dueDate: new Date(debt.dueDate).toISOString().split('T')[0],
      interestRate: debt.interestRate.toString(),
      description: debt.description || ''
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    haptics.light()
    setEditingId(null)
    setFormData({
      type: 'i_owe',
      person: '',
      amount: '',
      paidAmount: '',
      dueDate: '',
      interestRate: '',
      description: ''
    })
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    haptics.medium()
    try {
      // OPTIMISTIC DELETE
      const deletedDebt = debts.find(d => d.id === id)
      setDebts(prev => prev.filter(d => d.id !== id))
      
      try {
        await db.debts.delete(id)
        loadDebts()
        DataEvents.emit(DATA_EVENTS.DEBT_CHANGED)
        haptics.success()
      } catch (error) {
        handleError(error, 'Failed to delete debt entry')
        if (deletedDebt) {
          setDebts(prev => [deletedDebt, ...prev])
        }
      }
    } catch (error) {
      handleError(error, 'Failed to delete debt entry')
    }
  }

  async function markAsPaid(id: string | undefined) {
    if (!id) return
    const debt = await db.debts.get(id)
    if (!debt) return
    
    await db.debts.update(id, {
      status: 'paid',
      paidAmount: debt.amount,
      updatedAt: new Date()
    })
    loadDebts()
    DataEvents.emit(DATA_EVENTS.DEBT_CHANGED)
  }

  const filteredOwedToMe = filteredDebts.filter(d => d.type === 'owed_to_me' && d.status === 'active')
  const filteredIOwe = filteredDebts.filter(d => d.type === 'i_owe' && d.status === 'active')
  
  const totalOwedToMe = filteredOwedToMe.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
  const totalIOwe = filteredIOwe.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filters */}
      <div className="card space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search debts by person, description, or type..."
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</p>
          <QuickFilters
            value={filters.quickFilter || 'all'}
            onChange={(value) => {
              updateFilters({ quickFilter: value, dateRange: undefined })
            }}
          />
        </div>

        {/* Custom Date Range */}
        <DateRangePicker
          startDate={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : null}
          endDate={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : null}
          onChange={(start, end) => {
            updateFilters({
              quickFilter: 'all',
              dateRange: {
                start: start ? new Date(start) : null,
                end: end ? new Date(end + 'T23:59:59') : null
              }
            })
          }}
          onClear={() => updateFilters({ dateRange: undefined })}
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
          <div className="flex flex-wrap gap-2">
            <SortButton label="Due Date" field="dueDate" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Amount" field="amount" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Person" field="person" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Status" field="status" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Reset all filters
          </button>
        )}
        
        {/* Export Button */}
        {filteredDebts.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <ExportButton
              onClick={() => exportDebtToCSV(filteredDebts, currency, dateFormat)}
              label="Export Debts"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Owed to Me</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
            {formatCurrency(totalOwedToMe, currency)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredOwedToMe.length} active debt(s)
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">I Owe</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 truncate">
            {formatCurrency(totalIOwe, currency)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredIOwe.length} active debt(s)
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5 touch-manipulation"
          aria-label="Add new debt entry"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          Add Debt
        </button>
      </div>

      {/* Add Form - BottomSheet */}
      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Debt' : 'Add Debt'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input"
              >
                <option value="i_owe">I Owe (Money I need to pay)</option>
                <option value="owed_to_me">Owed to Me (Money I'll receive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Person/Entity *
              </label>
              <input
                type="text"
                required
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="input"
                placeholder="e.g., John, Credit Card Company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Already Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
              aria-label={editingId ? 'Save debt changes' : 'Add debt entry'}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {editingId ? 'Update Debt' : 'Save Debt'}
            </button>
            <button 
              type="button" 
              onClick={handleCancelEdit} 
              className="btn-secondary"
              disabled={submitting}
              aria-label="Cancel and close form"
            >
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Debt List */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : debts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No debts tracked yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first debt
            </button>
          </div>
        ) : (
          filteredDebts.map((debt) => (
            <SwipeableDebtItem
              key={debt.id}
              debt={debt}
              currency={currency}
              dateFormat={dateFormat}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkAsPaid={markAsPaid}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  )
}
