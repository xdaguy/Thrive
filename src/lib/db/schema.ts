import Dexie, { Table } from 'dexie'

// Type definitions
export interface Income {
  id?: string
  amount: number
  category: string
  source: string
  date: Date
  description: string
  recurring: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id?: string
  amount: number
  category: string
  paymentMethod: string
  date: Date
  description: string
  receipt?: string
  recurring: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Debt {
  id?: string
  type: 'owed_to_me' | 'i_owe'
  person: string
  amount: number
  paidAmount: number
  dueDate: Date
  interestRate: number
  description: string
  status: 'active' | 'paid'
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id?: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  dueTime?: string
  category: string
  tags: string[]
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Reminder {
  id?: string
  taskId?: string
  title: string
  datetime: Date
  recurring: 'none' | 'daily' | 'weekly' | 'monthly'
  notified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Weight {
  id?: string
  weight: number
  unit: 'kg' | 'lbs'
  date: Date
  note: string
  createdAt: Date
}

export interface Exercise {
  id?: string
  type: 'cardio' | 'gym' | 'sports' | 'other'
  name: string
  duration: number
  sets?: number
  reps?: number
  date: Date
  note: string
  createdAt: Date
}

export interface Meal {
  id?: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  asExpected: boolean
  photo?: string
  description: string
  date: Date
  createdAt: Date
}

export interface RoutineItem {
  id: string
  name: string
  order: number
}

export interface Routine {
  id?: string
  name: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  items: RoutineItem[]
  createdAt: Date
  updatedAt: Date
}

export interface RoutineCompletion {
  id?: string
  routineId: string
  date: Date
  completedItems: string[]
  completionRate: number
  createdAt: Date
}

export interface Settings {
  id: 'user_settings'
  theme: 'light' | 'dark' | 'system'
  currency: string
  weightUnit: 'kg' | 'lbs'
  dateFormat: string
  syncEnabled: boolean
  syncProvider?: 'google' | 'dropbox' | 'onedrive'
  encryptionEnabled: boolean
  lastSyncAt?: Date
  updatedAt: Date
}

// Database class
export class ThriveDB extends Dexie {
  income!: Table<Income>
  expenses!: Table<Expense>
  debts!: Table<Debt>
  tasks!: Table<Task>
  reminders!: Table<Reminder>
  weight!: Table<Weight>
  exercise!: Table<Exercise>
  meals!: Table<Meal>
  routines!: Table<Routine>
  routineCompletions!: Table<RoutineCompletion>
  settings!: Table<Settings>

  constructor() {
    super('ThriveDB')
    
    this.version(1).stores({
      income: '++id, date, category, createdAt',
      expenses: '++id, date, category, createdAt',
      debts: '++id, type, status, dueDate, createdAt',
      tasks: '++id, completed, priority, dueDate, createdAt',
      reminders: '++id, taskId, datetime, createdAt',
      weight: '++id, date, createdAt',
      exercise: '++id, date, type, createdAt',
      meals: '++id, date, mealType, createdAt',
      routines: '++id, name, timeOfDay, createdAt',
      routineCompletions: '++id, routineId, date, createdAt',
      settings: 'id'
    })
  }
}

// Create database instance
export const db = new ThriveDB()

// Initialize default settings
export async function initializeSettings() {
  const existing = await db.settings.get('user_settings')
  
  if (!existing) {
    await db.settings.add({
      id: 'user_settings',
      theme: 'system',
      currency: 'USD',
      weightUnit: 'kg',
      dateFormat: 'MM/DD/YYYY',
      syncEnabled: false,
      encryptionEnabled: false,
      updatedAt: new Date()
    })
  }
}

// Helper function to generate UUID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
