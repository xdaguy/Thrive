'use client'

interface QuickFiltersProps {
  value: string
  onChange: (value: 'all' | 'today' | 'this-week' | 'this-month' | 'last-month') => void
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' }
] as const

export function QuickFilters({ value, onChange }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          aria-label={`Filter by ${filter.label.toLowerCase()}`}
          aria-pressed={value === filter.value}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${value === filter.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

