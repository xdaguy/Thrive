'use client'

import { useState } from 'react'
import { IncomeTab } from '@/components/finance/income-tab'
import { ExpenseTab } from '@/components/finance/expense-tab'

type Tab = 'income' | 'expenses' | 'debts'

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('income')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Finance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your income, expenses, and debts
        </p>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'income'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'debts'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Debts
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'income' && <IncomeTab />}
          {activeTab === 'expenses' && <ExpenseTab />}
          {activeTab === 'debts' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">�</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Debt Tracking Coming Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Track money you owe and money owed to you
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
