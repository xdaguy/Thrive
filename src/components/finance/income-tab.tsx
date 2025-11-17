'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Trash2, Edit, Calendar, Loader2 } from 'lucide-react'
import { addIncome, getAllIncome, deleteIncome, updateIncome, type Income } from '@/lib/db/queries'
import { INCOME_CATEGORIES, formatCurrency, formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'

interface IncomeTabProps {
  openForm?: boolean
}

export function IncomeTab({ openForm }: IncomeTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'year' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: INCOME_CATEGORIES[0],
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false
  })

  useEffect(() => {
    loadIncomes()
    loadCurrency()

    // Listen for settings changes
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadCurrency)

    return () => {
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadCurrency)
    }
  }, [])

  useEffect(() => {
    // Auto-open form when openForm prop is true
    if (openForm) {
      setShowForm(true)
    }
  }, [openForm])

  async function loadCurrency() {
    try {
      const settings = await db.settings.get('user_settings')
      if (settings?.currency) {
        setCurrency(settings.currency)
      }
      if (settings?.dateFormat) {
        setDateFormat(settings.dateFormat)
      }
    } catch (error) {
      console.error('Failed to load currency:', error)
    }
  }

  async function loadIncomes() {
    setLoading(true)
    const startTime = Date.now()
    
    const data = await getAllIncome()
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setIncomes(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    if (amount > 1000000000) {
      toast.error('Amount seems unrealistically high. Please check.')
      return
    }
    
    setSubmitting(true)
    
    const incomeData = {
      amount,
      category: formData.category,
      source: formData.source,
      date: new Date(formData.date),
      description: formData.description,
      recurring: formData.recurring
    }
    
    try {
      if (editingId) {
        // OPTIMISTIC UPDATE: Update UI immediately
        const optimisticIncome = {
          ...incomeData,
          id: editingId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setIncomes(prev => prev.map(i => i.id === editingId ? optimisticIncome : i))
        setEditingId(null)
        setShowForm(false)
        
        // Save to DB in background
        await updateIncome(editingId, incomeData)
      } else {
        // OPTIMISTIC ADD: Show in UI immediately with temporary ID
        const tempId = `temp-${Date.now()}`
        const optimisticIncome = {
          ...incomeData,
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setIncomes(prev => [optimisticIncome, ...prev])
        setShowForm(false)
        
        // Save to DB in background and get real ID
        const realId = await addIncome(incomeData)
        
        // Replace temp ID with real ID - use filter to prevent duplicates
        setIncomes(prev => {
          const withoutTemp = prev.filter(i => i.id !== tempId)
          const withReal = { ...optimisticIncome, id: realId }
          return [withReal, ...withoutTemp]
        })
      }
      
      // Reset form
      setFormData({
        amount: '',
        category: INCOME_CATEGORIES[0],
        source: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        recurring: false
      })
      
      DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
    } catch (error) {
      // ROLLBACK on error
      console.error('Failed to save income:', error)
      toast.error('Failed to save. Please try again.')
      loadIncomes() // Reload from DB to restore correct state
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(income: Income) {
    setEditingId(income.id!)
    setFormData({
      amount: income.amount.toString(),
      category: income.category as any,
      source: income.source,
      date: new Date(income.date).toISOString().split('T')[0],
      description: income.description || '',
      recurring: income.recurring
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    setEditingId(null)
    setFormData({
      amount: '',
      category: INCOME_CATEGORIES[0],
      source: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      recurring: false
    })
    setShowForm(false)
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    confirmDelete(
      id,
      async () => {
        // OPTIMISTIC DELETE: Remove from UI immediately
        const deletedIncome = incomes.find(i => i.id === id)
        setIncomes(prev => prev.filter(i => i.id !== id))
        
        try {
          // Delete from DB in background
          await deleteIncome(id)
          DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
        } catch (error) {
          // ROLLBACK on error: Restore the deleted item
          console.error('Failed to delete income:', error)
          toast.error('Failed to delete. Please try again.')
          if (deletedIncome) {
            setIncomes(prev => [deletedIncome, ...prev])
          }
        }
      },
      'Delete Income Entry',
      'Are you sure you want to delete this income entry? This action cannot be undone.'
    )
  }

  // Filter incomes based on date range
  const filteredIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date)
    incomeDate.setHours(0, 0, 0, 0)
    const now = new Date()
    
    switch (dateFilter) {
      case 'all':
        return true
      case 'today': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return incomeDate.getTime() === today.getTime()
      }
      case 'month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return incomeDate >= startOfMonth && incomeDate <= endOfMonth
      }
      case 'year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const endOfYear = new Date(now.getFullYear(), 11, 31)
        return incomeDate >= startOfYear && incomeDate <= endOfYear
      }
      case 'custom': {
        if (!customStartDate && !customEndDate) return true
        const start = customStartDate ? new Date(customStartDate) : new Date(0)
        const end = customEndDate ? new Date(customEndDate) : new Date()
        return incomeDate >= start && incomeDate <= end
      }
      default:
        return true
    }
  })
  
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
  const allTimeIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Filter */}
      <div className="card">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('year')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setDateFilter('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {dateFilter === 'custom' && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: 0.25,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pl-0 sm:pl-8 pt-1">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input text-sm py-2 flex-1"
                    placeholder="Start date"
                  />
                  <span className="text-gray-500 text-sm text-center sm:text-left">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input text-sm py-2 flex-1"
                    placeholder="End date"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            {dateFilter === 'all' ? 'Total Income' :
             dateFilter === 'today' ? 'Today' :
             dateFilter === 'month' ? 'This Month' :
             dateFilter === 'year' ? 'This Year' : 'Selected Range'}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 truncate">
            {formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredIncomes.length} {filteredIncomes.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        {dateFilter !== 'all' && (
          <div className="card p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">All Time Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {formatCurrency(allTimeIncome, currency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {incomes.length} total {incomes.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
        <div className="card md:col-start-3 flex items-center justify-center p-3 sm:p-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5 touch-manipulation"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Income
          </button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? 'Edit Income' : 'Add Income'}
          </h3>
          
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
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source *
              </label>
              <input
                type="text"
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="input"
                placeholder="e.g., Main Job, Freelance Project"
              />
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurring income</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Update Income' : 'Save Income'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Income List */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : filteredIncomes.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No income entries yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first income
            </button>
          </div>
        ) : (
          filteredIncomes.map((income) => (
            <div
              key={income.id}
              className="card p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">{income.source}</h4>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {income.category}
                    </span>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                  {formatCurrency(income.amount, currency)}
                </p>
              </div>
              <div className="pl-[52px] flex items-start justify-between gap-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 flex-1 min-w-0">
                  <p className="truncate">
                    {formatDate(income.date, dateFormat)}
                    {income.description && ` • ${income.description}`}
                  </p>
                  {income.recurring && (
                    <span className="text-xs">Recurring</span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(income)}
                    className="btn-icon text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="btn-icon text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  )
}
