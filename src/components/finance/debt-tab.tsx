'use client'

import { useState, useEffect } from 'react'
import { Plus, CreditCard, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/constants'
import { db, generateId, type Debt } from '@/lib/db/schema'

export function DebtTab() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'i_owe' as 'owed_to_me' | 'i_owe',
    person: '',
    amount: '',
    paidAmount: '',
    dueDate: '',
    interestRate: '',
    description: ''
  })

  useEffect(() => {
    loadDebts()
  }, [])

  async function loadDebts() {
    const data = await db.debts.orderBy('createdAt').reverse().toArray()
    setDebts(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const id = generateId()
    const now = new Date()
    
    await db.debts.add({
      id,
      type: formData.type,
      person: formData.person,
      amount: parseFloat(formData.amount),
      paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
      description: formData.description,
      status: 'active',
      createdAt: now,
      updatedAt: now
    })

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
    loadDebts()
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    if (confirm('Delete this debt entry?')) {
      await db.debts.delete(id)
      loadDebts()
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
  }

  const owedToMe = debts.filter(d => d.type === 'owed_to_me' && d.status === 'active')
  const iOwe = debts.filter(d => d.type === 'i_owe' && d.status === 'active')
  
  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
  const totalIOwe = iOwe.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Owed to Me</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalOwedToMe)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {owedToMe.length} active debt(s)
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">I Owe</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalIOwe)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {iOwe.length} active debt(s)
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Debt
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Debt</h3>
          
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
            <button type="submit" className="btn-primary">Save Debt</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Debt List */}
      <div className="space-y-3">
        {debts.length === 0 ? (
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
          debts.map((debt) => {
            const remaining = debt.amount - debt.paidAmount
            const isPaid = debt.status === 'paid'
            const isOwedToMe = debt.type === 'owed_to_me'

            return (
              <div
                key={debt.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isPaid
                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-60'
                    : isOwedToMe
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPaid
                      ? 'bg-gray-200 dark:bg-gray-800'
                      : isOwedToMe
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {isPaid ? (
                      <CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <AlertCircle className={`w-6 h-6 ${
                        isOwedToMe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{debt.person}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isOwedToMe
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {isOwedToMe ? 'Owed to me' : 'I owe'}
                      </span>
                      {isPaid && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Due: {formatDate(debt.dueDate)}
                      {debt.description && ` • ${debt.description}`}
                    </p>
                    {!isPaid && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isOwedToMe ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(debt.paidAmount / debt.amount) * 100}%` }}
                          />
                        </div>
                        <span>
                          {formatCurrency(debt.paidAmount)} / {formatCurrency(debt.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isPaid
                        ? 'text-gray-600 dark:text-gray-400 line-through'
                        : isOwedToMe
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(remaining)}
                    </p>
                    {debt.interestRate > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {debt.interestRate}% interest
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  {!isPaid && (
                    <button
                      onClick={() => markAsPaid(debt.id)}
                      className="btn-icon text-green-600 dark:text-green-400"
                      title="Mark as paid"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="btn-icon text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
