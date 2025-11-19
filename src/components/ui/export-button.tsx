'use client'

import { Download } from 'lucide-react'
import { A11Y_LABELS } from '@/lib/a11y'

interface ExportButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'icon'
}

export function ExportButton({ onClick, label = 'Export', disabled = false, variant = 'secondary' }: ExportButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="btn-icon text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`${label} data to CSV`}
        title={label}
      >
        <Download className="w-5 h-5" aria-hidden="true" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50'
        }
      `}
      aria-label={`${label} data to CSV file`}
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  )
}

