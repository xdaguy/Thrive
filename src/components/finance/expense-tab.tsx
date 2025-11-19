'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, TrendingDown, Trash2, Edit, Calendar, Receipt, Loader2 } from 'lucide-react'
import { addExpense, getAllExpenses, deleteExpense, updateExpense, type Expense } from '@/lib/db/queries'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, formatCurrency, formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'
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
import { exportExpenseToCSV } from '@/lib/export'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MIN_LOADING_TIME_MS, MAX_AMOUNT_VALIDATION } from '@/lib/constants'

interface ExpenseTabProps {
  openForm?: boolean
}

// Swipeable Expense Item Wrapper
interface SwipeableExpenseItemProps {
  expense: Expense
  currency: string
  dateFormat: string
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

function SwipeableExpenseItem({ expense, currency, dateFormat, onEdit, onDelete }: SwipeableExpenseItemProps) {
  const { swipeHandlers, swipeStyle } = useSwipeToDelete(() => {
    onDelete(expense.id!)
  })

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
        className="relative p-4 bg-white dark:bg-[#1A1A1A] hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">{expense.description || 'Expense'}</h4>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  {expense.category}
                </span>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {expense.paymentMethod}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 flex-shrink-0">
            {formatCurrency(expense.amount, currency)}
          </p>
        </div>
        <div className="pl-[52px] flex items-start justify-between gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex-1 min-w-0">
            <p className="truncate">{formatDate(expense.date, dateFormat)}</p>
            {expense.recurring && (
              <span className="text-xs">Recurring</span>
            )}
            {expense.receipt && (
              <span className="text-xs flex items-center gap-1 mt-1">
                <Receipt className="w-3 h-3" /> Receipt attached
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(expense)}
              className="btn-icon text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label={`Edit expense for ${expense.description || expense.category}`}
              title="Edit"
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onDelete(expense.id!)}
              className="btn-icon text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label={`Delete expense for ${expense.description || expense.category}`}
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

export function ExpenseTab({ openForm }: ExpenseTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const { currency, dateFormat } = useSettings()
  const { handleError } = useErrorHandler()
  const { ensureMinimumTime } = useMinimumLoadingTime()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    paymentMethod: PAYMENT_METHODS[0],
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false
  })

  // Search and filter
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filters,
    filteredItems: filteredExpenses,
    hasActiveFilters,
    handleSort,
    updateFilters,
    resetFilters
  } = useSearchFilter(expenses, {
    searchFields: ['description', 'category', 'paymentMethod'],
    sortableFields: ['date', 'amount', 'category', 'paymentMethod'],
    defaultSortField: 'date',
    defaultSortDirection: 'desc'
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  useEffect(() => {
    // Auto-open form when openForm prop is true
    if (openForm) {
      setShowForm(true)
    }
  }, [openForm])

  async function loadExpenses() {
    try {
      setLoading(true)
      const data = await ensureMinimumTime(getAllExpenses(), MIN_LOADING_TIME_MS)
      setExpenses(data)
    } catch (error) {
      handleError(error, 'Failed to load expense entries')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    haptics.light()
    
    // Validation
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      haptics.error()
      return
    }
    if (amount > MAX_AMOUNT_VALIDATION) {
      toast.error('Amount seems unrealistically high. Please check.')
      haptics.error()
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
    const expenseData = {
      amount,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      date: new Date(formData.date),
      description: formData.description,
      recurring: formData.recurring
    }
    
    try {
      if (editingId) {
        // OPTIMISTIC UPDATE
        const optimisticExpense = {
          ...expenseData,
          id: editingId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setExpenses(prev => prev.map(e => e.id === editingId ? optimisticExpense : e))
        setEditingId(null)
        setShowForm(false)
        await updateExpense(editingId, expenseData)
      } else {
        // OPTIMISTIC ADD
        const tempId = `temp-${Date.now()}`
        const optimisticExpense = {
          ...expenseData,
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setExpenses(prev => [optimisticExpense, ...prev])
        setShowForm(false)
        const realId = await addExpense(expenseData)
        setExpenses(prev => {
          const withoutTemp = prev.filter(e => e.id !== tempId)
          const withReal = { ...optimisticExpense, id: realId }
          return [withReal, ...withoutTemp]
        })
      }
      
      setFormData({
        amount: '',
        category: EXPENSE_CATEGORIES[0],
        paymentMethod: PAYMENT_METHODS[0],
        date: new Date().toISOString().split('T')[0],
        description: '',
        recurring: false
      })
      
      DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
      haptics.success()
    } catch (error) {
      handleError(error, 'Failed to save expense entry')
      loadExpenses()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(expense: Expense) {
    haptics.light()
    setEditingId(expense.id!)
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category as any,
      paymentMethod: expense.paymentMethod as any,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
      recurring: expense.recurring
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    haptics.light()
    setEditingId(null)
    setFormData({
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      paymentMethod: PAYMENT_METHODS[0],
      date: new Date().toISOString().split('T')[0],
      description: '',
      recurring: false
    })
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    haptics.medium()
    try {
      // OPTIMISTIC DELETE
      const deletedExpense = expenses.find(e => e.id === id)
      setExpenses(prev => prev.filter(e => e.id !== id))
      
      try {
        await deleteExpense(id)
        DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
        haptics.success()
      } catch (error) {
        handleError(error, 'Failed to delete expense entry')
        if (deletedExpense) {
          setExpenses(prev => [deletedExpense, ...prev])
        }
      }
    } catch (error) {
      handleError(error, 'Failed to delete expense entry')
    }
  }

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  )
  const allTimeExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filters */}
      <div className="card space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search expenses by description, category, or payment method..."
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Period</p>
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
            <SortButton label="Date" field="date" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Amount" field="amount" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Category" field="category" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Payment" field="paymentMethod" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Reset all filters
          </button>
        )}
        
        {/* Export Button */}
        {filteredExpenses.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <ExportButton
              onClick={() => exportExpenseToCSV(filteredExpenses, currency, dateFormat)}
              label="Export Expenses"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            {filters.quickFilter === 'all' ? 'Total Expenses' :
             filters.quickFilter === 'today' ? 'Today' :
             filters.quickFilter === 'this-week' ? 'This Week' :
             filters.quickFilter === 'this-month' ? 'This Month' :
             filters.quickFilter === 'last-month' ? 'Last Month' : 'Filtered Total'}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 truncate">
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        {hasActiveFilters && (
          <div className="card p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">All Time Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {formatCurrency(allTimeExpenses, currency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {expenses.length} total {expenses.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
        <div className={`card ${!hasActiveFilters ? 'md:col-start-3' : ''} flex items-center justify-center p-3 sm:p-4`}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5 touch-manipulation"
            aria-label="Add new expense entry"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Add Form - BottomSheet */}
      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="input"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="input"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
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
                placeholder="Optional notes..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl cursor-pointer hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 rounded-xl shadow-sm">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Recurring Expense</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Repeats automatically</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    haptics.light()
                    setFormData({ ...formData, recurring: !formData.recurring })
                  }}
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full transition-all duration-200 shadow-inner ${
                    formData.recurring 
                      ? 'bg-red-600 shadow-red-600/30' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-200 ${
                      formData.recurring ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
              aria-label={editingId ? 'Save expense changes' : 'Add expense entry'}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {editingId ? 'Update Expense' : 'Save Expense'}
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

      {/* Expense List */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No expense entries yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <SwipeableExpenseItem
              key={expense.id}
              expense={expense}
              currency={currency}
              dateFormat={dateFormat}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  )
}
