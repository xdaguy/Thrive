'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Trash2, Edit, Calendar } from 'lucide-react'
import { addIncome, getAllIncome, deleteIncome, updateIncome, type Income } from '@/lib/db/queries'
import { INCOME_CATEGORIES, formatCurrency, formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'

export function IncomeTab() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'year' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [currency, setCurrency] = useState('USD')
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
  }, [])

  async function loadCurrency() {
    try {
      const settings = await db.settings.get('user_settings')
      if (settings?.currency) {
        setCurrency(settings.currency)
      }
    } catch (error) {
      console.error('Failed to load currency:', error)
    }
  }

  async function loadIncomes() {
    const data = await getAllIncome()
    setIncomes(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      alert('Amount must be greater than 0')
      return
    }
    if (amount > 1000000000) {
      alert('Amount seems unrealistically high. Please check.')
      return
    }
    
    const incomeData = {
      amount,
      category: formData.category,
      source: formData.source,
      date: new Date(formData.date),
      description: formData.description,
      recurring: formData.recurring
    }
    
    if (editingId) {
      // Update existing income
      await updateIncome(editingId, incomeData)
      setEditingId(null)
    } else {
      // Add new income
      await addIncome(incomeData)
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
    setShowForm(false)
    loadIncomes()
    DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
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
    if (confirm('Are you sure you want to delete this income entry?')) {
      await deleteIncome(id)
      loadIncomes()
      DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
    }
  }

  // Filter incomes based on date range
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.date)
    const now = new Date()
    
    switch (dateFilter) {
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
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
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
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="input text-sm py-1"
                placeholder="Start date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="input text-sm py-1"
                placeholder="End date"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {dateFilter === 'all' ? 'Total Income' : 
             dateFilter === 'month' ? 'This Month' :
             dateFilter === 'year' ? 'This Year' : 'Selected Range'}
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filteredIncomes.length} {filteredIncomes.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        {dateFilter !== 'all' && (
          <div className="card">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">All Time Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(allTimeIncome, currency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {incomes.length} total {incomes.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
        <div className="card md:col-start-3 flex items-center justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Income
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
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
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Income' : 'Save Income'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Income List */}
      <div className="space-y-3">
        {filteredIncomes.length === 0 ? (
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
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{income.source}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {income.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(income.date)}
                    {income.description && ` • ${income.description}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(income.amount, currency)}
                  </p>
                  {income.recurring && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Recurring</span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEdit(income)}
                  className="btn-icon text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Edit income"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(income.id)}
                  className="btn-icon text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete income"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
