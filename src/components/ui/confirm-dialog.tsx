'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, Trash2, X } from 'lucide-react'

type ConfirmVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  details?: string[]
  variant?: ConfirmVariant
  confirmText?: string
  cancelText?: string
}

const variants = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/20',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/20',
    confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  const config = variants[variant]
  const Icon = config.icon

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {title}
                    </h3>
                    {message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                      </p>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Details List */}
                {details && details.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {details.map((detail, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#0A0A0A] flex items-center gap-3 justify-end border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all active:scale-95 ${config.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for easier usage
export function useConfirm() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message?: string
    details?: string[]
    variant?: ConfirmVariant
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  })

  const confirm = (options: Omit<typeof dialog, 'isOpen'>) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: () => {
          options.onConfirm()
          resolve(true)
        },
      })
    })
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      {...dialog}
      onClose={() => setDialog({ ...dialog, isOpen: false })}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
