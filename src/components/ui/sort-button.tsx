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
  
  const directionText = isActive 
    ? sortDirection === 'asc' ? 'ascending' : 'descending'
    : 'not sorted'
  
  const ariaLabel = `${label}, ${directionText}. Click to ${isActive && sortDirection === 'asc' ? 'sort descending' : 'sort ascending'}`

  return (
    <button
      onClick={() => onSort(field)}
      aria-label={ariaLabel}
      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
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
          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
      )}
    </button>
  )
}

