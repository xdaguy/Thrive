/**
 * Sync and Backup Data Types
 */

import type { 
  Income, 
  Expense, 
  Debt, 
  Task, 
  Reminder, 
  Weight, 
  Exercise, 
  Meal, 
  Routine, 
  RoutineCompletion,
  Settings 
} from '../db/schema'

/**
 * Complete backup data structure with versioning
 */
export interface BackupData {
  // Version information
  schemaVersion: number
  appVersion: string
  minCompatibleVersion: number
  
  // Export metadata
  exportDate: string
  deviceId: string
  deviceName: string
  
  // Feature flags (what data is included)
  features: string[]
  
  // Core data tables
  income: Income[]
  expenses: Expense[]
  debts: Debt[]
  tasks: Task[]
  reminders: Reminder[]
  weight: Weight[]
  exercise: Exercise[]
  meals: Meal[]
  routines: Routine[]
  routineCompletions: RoutineCompletion[]
  settings: Settings[]
  
  // Data statistics
  stats: BackupStats
  
  // Reserved for future unknown fields from newer versions
  [key: string]: any
}

/**
 * Statistics about the backup
 */
export interface BackupStats {
  totalEntries: number
  entriesByType: Record<string, number>
  dateRange: {
    earliest: string | null
    latest: string | null
  }
  size: {
    bytes: number
    formatted: string
  }
}

/**
 * Sync metadata stored locally
 */
export interface SyncMetadata {
  lastSyncAt: Date
  lastSyncHash: string
  deviceId: string
  syncProvider: 'google-drive' | 'local' | null
  syncStatus: 'idle' | 'syncing' | 'error'
  lastError: string | null
}

/**
 * Import options
 */
export interface ImportOptions {
  merge: boolean              // Merge with existing data vs replace
  preserveUnknown: boolean    // Keep unknown fields from newer versions
  skipDuplicates: boolean     // Skip entries with same ID
  validateSchema: boolean     // Validate data structure before import
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean
  message: string
  stats: {
    imported: number
    skipped: number
    errors: number
  }
  warnings: string[]
}

/**
 * Merge conflict
 */
export interface MergeConflict {
  type: 'income' | 'expense' | 'debt' | 'task' | 'routine' | string
  id: string
  local: any
  remote: any
  timestamp: {
    local: Date
    remote: Date
  }
}
