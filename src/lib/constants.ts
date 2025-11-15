// Category constants
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Refund',
  'Other'
] as const

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Housing',
  'Insurance',
  'Subscriptions',
  'Gifts & Donations',
  'Other'
] as const

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'PayPal',
  'Other'
] as const

export const TASK_PRIORITIES = [
  'low',
  'medium',
  'high'
] as const

export const EXERCISE_TYPES = [
  'cardio',
  'gym',
  'sports',
  'other'
] as const

export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack'
] as const

export const ROUTINE_TIMES = [
  'morning',
  'afternoon',
  'evening',
  'night'
] as const

// Get currency symbol mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'CNY': '¥',
  'AUD': 'A$',
  'CAD': 'C$'
}

// Currency formatter
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Simple currency formatter with symbol (for components that can't be async)
export function formatCurrencySimple(amount: number, currencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$'
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Date formatter
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d)
}

// Relative time formatter
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(d)
}
