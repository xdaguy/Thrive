'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, CheckSquare, Dumbbell, Weight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { haptics } from '@/lib/haptics'

interface QuickAddSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddSheet({ isOpen, onClose }: QuickAddSheetProps) {
  const router = useRouter()

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Add Income',
      description: 'Log income',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      onClick: () => {
        router.push('/finance?tab=income&add=true')
        onClose()
      }
    },
    {
      icon: TrendingDown,
      label: 'Add Expense',
      description: 'Track spending',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      onClick: () => {
        router.push('/finance?tab=expenses&add=true')
        onClose()
      }
    },
    {
      icon: CheckSquare,
      label: 'Add Task',
      description: 'Create task',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      onClick: () => {
        router.push('/tasks?add=true')
        onClose()
      }
    },
    {
      icon: Dumbbell,
      label: 'Log Exercise',
      description: 'Track workout',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      onClick: () => {
        router.push('/health?tab=exercise&add=true')
        onClose()
      }
    },
    {
      icon: Weight,
      label: 'Log Weight',
      description: 'Update weight',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      onClick: () => {
        router.push('/health?tab=weight&add=true')
        onClose()
      }
    }
  ]

  const handleClose = () => {
    haptics.light()
    onClose()
  }

  const handleActionClick = (action: typeof quickActions[0]) => {
    haptics.medium()
    action.onClick()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
        <div className="bg-white dark:bg-[#1A1A1A] rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1A1A1A]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Add</h2>
            <motion.button
              onClick={handleClose}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  onClick={() => handleActionClick(action)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all touch-manipulation"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{action.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Safe area spacing */}
          <div className="h-20" />
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
