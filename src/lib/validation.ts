// Validation utility functions for forms

export const validators = {
  // Amount validation
  amount: (value: string, max = 1000000000) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'Please enter a valid number'
    if (num <= 0) return 'Amount must be greater than 0'
    if (num > max) return 'Amount seems unrealistically high'
    return null
  },

  // Weight validation
  weight: (value: string, unit: 'kg' | 'lbs' = 'kg') => {
    const num = parseFloat(value)
    const max = unit === 'kg' ? 500 : 1000
    if (isNaN(num)) return 'Please enter a valid number'
    if (num <= 0) return 'Weight must be greater than 0'
    if (num > max) return 'Weight seems unrealistic'
    return null
  },

  // Duration validation (minutes)
  duration: (value: string, max = 1440) => {
    const num = parseInt(value)
    if (isNaN(num)) return 'Please enter a valid number'
    if (num <= 0) return 'Duration must be greater than 0'
    if (num > max) return 'Duration too long (max 24 hours)'
    return null
  },

  // Required text
  required: (value: string, fieldName = 'This field') => {
    if (!value || !value.trim()) return `${fieldName} is required`
    return null
  },

  // Max length
  maxLength: (value: string, max: number, fieldName = 'Text') => {
    if (value.length > max) return `${fieldName} is too long (max ${max} characters)`
    return null
  },

  // Date validation (no future dates for past events)
  noFutureDate: (value: string) => {
    const date = new Date(value)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (date > today) return 'Date cannot be in the future'
    return null
  },

  // Interest rate
  interestRate: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'Please enter a valid number'
    if (num < 0 || num > 100) return 'Interest rate must be between 0 and 100%'
    return null
  },

  // Paid amount vs total
  paidAmount: (paid: string, total: string) => {
    const p = parseFloat(paid)
    const t = parseFloat(total)
    if (isNaN(p)) return 'Please enter a valid number'
    if (p < 0) return 'Paid amount cannot be negative'
    if (p > t) return 'Paid amount cannot exceed total amount'
    return null
  }
}

// Real-time validation helper
export function validateField(value: any, rules: Array<(val: any) => string | null>): string | null {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// Debounced validation for real-time feedback
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
