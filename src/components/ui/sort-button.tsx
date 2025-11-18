'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SortButtonProps {
  label: string
  field: string
  currentSortField: string
  sortDirection: 'asc' | 'desc'
  onSort: (field: string) => void
}

export function SortButton({ label, field, currentSortField, sortDirection, onSort }: SortButtonProps) {
  const isActive = currentSortField === field
  
  return (
    <button
      onClick={() => onSort(field)}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      {label}
      {isActive ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  )
}

