'use client'

import { Calendar } from 'lucide-react'
import { useState } from 'react'

interface DateRangePickerProps {
  startDate: string | null
  endDate: string | null
  onChange: (start: string | null, end: string | null) => void
  onClear?: () => void
  className?: string
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onChange, 
  onClear,
  className = '' 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    onChange(value, endDate)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null
    onChange(startDate, value)
  }

  const handleClear = () => {
    onChange(null, null)
    onClear?.()
  }

  const hasRange = startDate || endDate

  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Date Range</p>
        {hasRange && onClear && (
          <button
            onClick={handleClear}
            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Clear date range"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate || ''}
            onChange={handleStartDateChange}
            max={endDate || undefined}
            className="input text-sm"
            aria-label="Select start date"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate || ''}
            onChange={handleEndDateChange}
            min={startDate || undefined}
            className="input text-sm"
            aria-label="Select end date"
          />
        </div>
      </div>

      {hasRange && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {startDate && endDate 
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : startDate 
            ? `From ${formatDate(startDate)}`
            : `Until ${formatDate(endDate!)}`
          }
        </p>
      )}
    </div>
  )
}

