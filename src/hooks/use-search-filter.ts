'use client'

import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SearchFilterOptions {
  searchFields: string[] // Fields to search in
  sortableFields: string[] // Fields that can be sorted
  defaultSortField?: string
  defaultSortDirection?: SortDirection
}

export interface FilterOptions {
  dateRange?: {
    start: Date | null
    end: Date | null
  }
  amountRange?: {
    min: number | null
    max: number | null
  }
  categories?: string[]
  priorities?: string[]
  status?: string[]
  quickFilter?: 'today' | 'this-week' | 'this-month' | 'last-month' | 'all'
}

export function useSearchFilter<T extends Record<string, any>>(
  items: T[],
  options: SearchFilterOptions
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(options.defaultSortField || '')
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    options.defaultSortDirection || 'desc'
  )
  const [filters, setFilters] = useState<FilterOptions>({
    quickFilter: 'all'
  })

  // Apply quick filter to date range
  const getQuickFilterDateRange = useCallback((quickFilter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (quickFilter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      case 'this-week': {
        const dayOfWeek = today.getDay()
        const start = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
        return { start, end }
      }
      case 'this-month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return { start, end }
      }
      case 'last-month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start, end }
      }
      default:
        return { start: null, end: null }
    }
  }, [])

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => {
        return options.searchFields.some(field => {
          const value = item[field]
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(query)
        })
      })
    }

    // Apply quick filter date range
    if (filters.quickFilter && filters.quickFilter !== 'all') {
      const dateRange = getQuickFilterDateRange(filters.quickFilter)
      if (dateRange.start && dateRange.end) {
        result = result.filter(item => {
          const itemDate = item.date ? new Date(item.date) : item.dueDate ? new Date(item.dueDate) : null
          if (!itemDate) return false
          return itemDate >= dateRange.start! && itemDate <= dateRange.end!
        })
      }
    }

    // Apply custom date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      result = result.filter(item => {
        const itemDate = item.date ? new Date(item.date) : item.dueDate ? new Date(item.dueDate) : null
        if (!itemDate) return false
        
        if (filters.dateRange?.start && itemDate < filters.dateRange.start) {
          return false
        }
        if (filters.dateRange?.end && itemDate > filters.dateRange.end) {
          return false
        }
        return true
      })
    }

    // Apply amount range filter
    if (filters.amountRange?.min !== null && filters.amountRange?.min !== undefined) {
      result = result.filter(item => {
        const amount = item.amount || 0
        return amount >= filters.amountRange!.min!
      })
    }
    if (filters.amountRange?.max !== null && filters.amountRange?.max !== undefined) {
      result = result.filter(item => {
        const amount = item.amount || 0
        return amount <= filters.amountRange!.max!
      })
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(item => {
        return filters.categories!.includes(item.category)
      })
    }

    // Apply priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      result = result.filter(item => {
        return filters.priorities!.includes(item.priority)
      })
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(item => {
        return filters.status!.includes(item.status)
      })
    }

    // Apply sorting
    if (sortField && options.sortableFields.includes(sortField)) {
      result.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]

        // Handle dates
        if (aVal instanceof Date || bVal instanceof Date) {
          const aTime = aVal instanceof Date ? aVal.getTime() : new Date(aVal).getTime()
          const bTime = bVal instanceof Date ? bVal.getTime() : new Date(bVal).getTime()
          return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
        }

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }

        // Handle strings
        const aStr = String(aVal || '').toLowerCase()
        const bStr = String(bVal || '').toLowerCase()
        const comparison = aStr.localeCompare(bStr)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [items, searchQuery, sortField, sortDirection, filters, options.searchFields, options.sortableFields, getQuickFilterDateRange])

  // Toggle sort direction or change sort field
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }, [sortField])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setSortField(options.defaultSortField || '')
    setSortDirection(options.defaultSortDirection || 'desc')
    setFilters({ quickFilter: 'all' })
  }, [options.defaultSortField, options.defaultSortDirection])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filters.quickFilter !== 'all' ||
      !!filters.dateRange?.start ||
      !!filters.dateRange?.end ||
      (filters.amountRange?.min !== null && filters.amountRange?.min !== undefined) ||
      (filters.amountRange?.max !== null && filters.amountRange?.max !== undefined) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.priorities && filters.priorities.length > 0) ||
      (filters.status && filters.status.length > 0)
    )
  }, [searchQuery, filters])

  return {
    // State
    searchQuery,
    sortField,
    sortDirection,
    filters,
    filteredItems,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    handleSort,
    updateFilters,
    resetFilters
  }
}

