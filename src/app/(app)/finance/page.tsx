'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IncomeTab } from '@/components/finance/income-tab'
import { ExpenseTab } from '@/components/finance/expense-tab'
import { DebtTab } from '@/components/finance/debt-tab'
import { fadeIn, tabContent } from '@/lib/animations'

type Tab = 'income' | 'expenses' | 'debts'

export default function FinancePage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('income')
  const [openFormTrigger, setOpenFormTrigger] = useState(0)

  useEffect(() => {
    // Handle URL parameters for tab and form opening
    const tab = searchParams.get('tab') as Tab
    const add = searchParams.get('add')
    
    if (tab && ['income', 'expenses', 'debts'].includes(tab)) {
      setActiveTab(tab)
    }
    
    // Trigger form opening by incrementing counter (avoids timing issues)
    if (add === 'true') {
      setOpenFormTrigger(prev => prev + 1)
    }
  }, [searchParams])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div {...fadeIn}>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Finance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your income, expenses, and debts
        </p>
      </motion.div>

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
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            {...tabContent}
            className="p-6"
          >
            {activeTab === 'income' && <IncomeTab key={`income-${openFormTrigger}`} openForm={openFormTrigger > 0} />}
            {activeTab === 'expenses' && <ExpenseTab key={`expenses-${openFormTrigger}`} openForm={openFormTrigger > 0} />}
            {activeTab === 'debts' && <DebtTab key={`debts-${openFormTrigger}`} openForm={openFormTrigger > 0} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
