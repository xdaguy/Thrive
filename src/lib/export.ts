/**
 * Export utilities for Thrive
 * Provides CSV export functionality for all data types
 */

import { formatDate, formatCurrency } from './constants'
import type { Income, Expense, Debt, Task, Weight, Exercise, Meal, Routine } from './db/schema'

/**
 * Convert data to CSV format
 */
function toCSV<T>(data: T[], headers: string[], getRow: (item: T) => string[]): string {
  const rows = [headers.join(','), ...data.map(item => getRow(item).join(','))]
  return rows.join('\n')
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Escape CSV field (handles commas, quotes, newlines)
 */
function escapeCSVField(field: string | number | Date | null | undefined): string {
  if (field === null || field === undefined) return ''
  
  const str = field instanceof Date ? formatDate(field, 'MM/DD/YYYY') : String(field)
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

/**
 * Export income data to CSV
 */
export function exportIncomeToCSV(incomes: Income[], currency: string, dateFormat: string) {
  const headers = ['Date', 'Source', 'Category', 'Amount', 'Description', 'Recurring']
  
  const getRow = (income: Income) => [
    escapeCSVField(formatDate(income.date, dateFormat)),
    escapeCSVField(income.source),
    escapeCSVField(income.category),
    escapeCSVField(formatCurrency(income.amount, currency)),
    escapeCSVField(income.description || ''),
    escapeCSVField(income.recurring ? 'Yes' : 'No'),
  ]
  
  const csv = toCSV(incomes, headers, getRow)
  const filename = `income-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export expense data to CSV
 */
export function exportExpenseToCSV(expenses: Expense[], currency: string, dateFormat: string) {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Recurring']
  
  const getRow = (expense: Expense) => [
    escapeCSVField(formatDate(expense.date, dateFormat)),
    escapeCSVField(expense.description || ''),
    escapeCSVField(expense.category),
    escapeCSVField(formatCurrency(expense.amount, currency)),
    escapeCSVField(expense.paymentMethod),
    escapeCSVField(expense.recurring ? 'Yes' : 'No'),
  ]
  
  const csv = toCSV(expenses, headers, getRow)
  const filename = `expense-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export debt data to CSV
 */
export function exportDebtToCSV(debts: Debt[], currency: string, dateFormat: string) {
  const headers = ['Type', 'Person/Entity', 'Amount', 'Paid Amount', 'Remaining', 'Due Date', 'Interest Rate', 'Status', 'Description']
  
  const getRow = (debt: Debt) => [
    escapeCSVField(debt.type === 'i_owe' ? 'I Owe' : 'Owed to Me'),
    escapeCSVField(debt.person),
    escapeCSVField(formatCurrency(debt.amount, currency)),
    escapeCSVField(formatCurrency(debt.paidAmount, currency)),
    escapeCSVField(formatCurrency(debt.amount - debt.paidAmount, currency)),
    escapeCSVField(debt.dueDate ? formatDate(debt.dueDate, dateFormat) : ''),
    escapeCSVField(debt.interestRate > 0 ? `${debt.interestRate}%` : ''),
    escapeCSVField(debt.status),
    escapeCSVField(debt.description || ''),
  ]
  
  const csv = toCSV(debts, headers, getRow)
  const filename = `debt-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export task data to CSV
 */
export function exportTasksToCSV(tasks: Task[], dateFormat: string) {
  const headers = ['Title', 'Description', 'Category', 'Priority', 'Due Date', 'Completed', 'Created Date']
  
  const getRow = (task: Task) => [
    escapeCSVField(task.title),
    escapeCSVField(task.description || ''),
    escapeCSVField(task.category || ''),
    escapeCSVField(task.priority),
    escapeCSVField(task.dueDate ? formatDate(task.dueDate, dateFormat) : ''),
    escapeCSVField(task.completed ? 'Yes' : 'No'),
    escapeCSVField(formatDate(task.createdAt, dateFormat)),
  ]
  
  const csv = toCSV(tasks, headers, getRow)
  const filename = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export weight data to CSV
 */
export function exportWeightToCSV(weights: Weight[], dateFormat: string) {
  const headers = ['Date', 'Weight', 'Unit', 'Note']
  
  const getRow = (weight: Weight) => [
    escapeCSVField(formatDate(weight.date, dateFormat)),
    escapeCSVField(weight.weight),
    escapeCSVField(weight.unit),
    escapeCSVField(weight.note || ''),
  ]
  
  const csv = toCSV(weights, headers, getRow)
  const filename = `weight-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export exercise data to CSV
 */
export function exportExerciseToCSV(exercises: Exercise[], dateFormat: string) {
  const headers = ['Date', 'Name', 'Type', 'Duration (min)', 'Sets', 'Reps', 'Note']
  
  const getRow = (exercise: Exercise) => [
    escapeCSVField(formatDate(exercise.date, dateFormat)),
    escapeCSVField(exercise.name),
    escapeCSVField(exercise.type),
    escapeCSVField(exercise.duration),
    escapeCSVField(exercise.sets || ''),
    escapeCSVField(exercise.reps || ''),
    escapeCSVField(exercise.note || ''),
  ]
  
  const csv = toCSV(exercises, headers, getRow)
  const filename = `exercise-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export meal data to CSV
 */
export function exportMealsToCSV(meals: Meal[], dateFormat: string) {
  const headers = ['Date', 'Meal Type', 'Description', 'As Expected']
  
  const getRow = (meal: Meal) => [
    escapeCSVField(formatDate(meal.date, dateFormat)),
    escapeCSVField(meal.mealType),
    escapeCSVField(meal.description || ''),
    escapeCSVField(meal.asExpected ? 'Yes' : 'No'),
  ]
  
  const csv = toCSV(meals, headers, getRow)
  const filename = `meals-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export routine data to CSV
 */
export function exportRoutinesToCSV(routines: Routine[]) {
  const headers = ['Name', 'Time of Day', 'Items', 'Created Date']
  
  const getRow = (routine: Routine) => [
    escapeCSVField(routine.name),
    escapeCSVField(routine.timeOfDay),
    escapeCSVField(routine.items.map(item => item.name).join('; ')),
    escapeCSVField(formatDate(routine.createdAt, 'MM/DD/YYYY')),
  ]
  
  const csv = toCSV(routines, headers, getRow)
  const filename = `routines-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

/**
 * Export all financial data to CSV
 */
export function exportAllFinanceToCSV(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  currency: string,
  dateFormat: string
) {
  const allData: string[] = []
  
  // Income section
  allData.push('INCOME DATA')
  allData.push('Date,Source,Category,Amount,Description,Recurring')
  incomes.forEach(income => {
    allData.push([
      escapeCSVField(formatDate(income.date, dateFormat)),
      escapeCSVField(income.source),
      escapeCSVField(income.category),
      escapeCSVField(formatCurrency(income.amount, currency)),
      escapeCSVField(income.description || ''),
      escapeCSVField(income.recurring ? 'Yes' : 'No'),
    ].join(','))
  })
  
  allData.push('')
  allData.push('EXPENSE DATA')
  allData.push('Date,Description,Category,Amount,Payment Method,Recurring')
  expenses.forEach(expense => {
    allData.push([
      escapeCSVField(formatDate(expense.date, dateFormat)),
      escapeCSVField(expense.description || ''),
      escapeCSVField(expense.category),
      escapeCSVField(formatCurrency(expense.amount, currency)),
      escapeCSVField(expense.paymentMethod),
      escapeCSVField(expense.recurring ? 'Yes' : 'No'),
    ].join(','))
  })
  
  allData.push('')
  allData.push('DEBT DATA')
  allData.push('Type,Person/Entity,Amount,Paid Amount,Remaining,Due Date,Interest Rate,Status,Description')
  debts.forEach(debt => {
    allData.push([
      escapeCSVField(debt.type === 'i_owe' ? 'I Owe' : 'Owed to Me'),
      escapeCSVField(debt.person),
      escapeCSVField(formatCurrency(debt.amount, currency)),
      escapeCSVField(formatCurrency(debt.paidAmount, currency)),
      escapeCSVField(formatCurrency(debt.amount - debt.paidAmount, currency)),
      escapeCSVField(debt.dueDate ? formatDate(debt.dueDate, dateFormat) : ''),
      escapeCSVField(debt.interestRate > 0 ? `${debt.interestRate}%` : ''),
      escapeCSVField(debt.status),
      escapeCSVField(debt.description || ''),
    ].join(','))
  })
  
  const csv = allData.join('\n')
  const filename = `finance-export-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csv, filename)
}

