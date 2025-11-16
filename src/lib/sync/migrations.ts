/**
 * Data Migration System
 * 
 * Handles migrating data from older schema versions to the current version.
 * Each migration function should be pure and idempotent.
 */

import { CURRENT_SCHEMA_VERSION } from './schema-version'
import type { BackupData } from './types'

/**
 * Migration function type
 */
type MigrationFunction = (data: any) => any

/**
 * Migration registry
 * Key is the TARGET schema version, value is the migration function
 */
const MIGRATIONS: Record<number, MigrationFunction> = {
  // Schema 1 - Initial version (no migration needed)
  1: (data: any) => data,
  
  // Future migrations will be added here
  // Example for Schema 2:
  // 2: (data: any) => {
  //   return {
  //     ...data,
  //     schemaVersion: 2,
  //     // Add new fields with defaults
  //     goals: data.goals || [],
  //     subscriptions: data.subscriptions || [],
  //   }
  // },
  
  // Example for Schema 3:
  // 3: (data: any) => {
  //   return {
  //     ...data,
  //     schemaVersion: 3,
  //     // Add new fields
  //     budgets: data.budgets || [],
  //     customCategories: data.customCategories || [],
  //     // Transform existing data if needed
  //     expenses: data.expenses.map((e: any) => ({
  //       ...e,
  //       categoryId: e.category // Reference to custom categories
  //     }))
  //   }
  // }
}

/**
 * Migrate data from old schema to current schema
 */
export function migrateData(data: any): BackupData {
  const currentVersion = data.schemaVersion || 1
  
  // Already at current version
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    return data as BackupData
  }
  
  // Migration not needed (already newer or same)
  if (currentVersion > CURRENT_SCHEMA_VERSION) {
    console.warn(`Data is from newer version ${currentVersion}, current is ${CURRENT_SCHEMA_VERSION}`)
    return data as BackupData
  }
  
  // Apply migrations sequentially
  let migratedData = { ...data }
  let targetVersion = currentVersion
  
  console.log(`Migrating data from schema ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`)
  
  while (targetVersion < CURRENT_SCHEMA_VERSION) {
    targetVersion++
    
    const migration = MIGRATIONS[targetVersion]
    if (!migration) {
      throw new Error(`Missing migration for schema version ${targetVersion}`)
    }
    
    console.log(`Applying migration to schema ${targetVersion}`)
    migratedData = migration(migratedData)
    migratedData.schemaVersion = targetVersion
  }
  
  return migratedData as BackupData
}

/**
 * Validate data structure before migration
 */
export function validateDataStructure(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required fields
  if (typeof data.schemaVersion !== 'number') {
    errors.push('Missing or invalid schemaVersion')
  }
  
  if (!data.appVersion) {
    errors.push('Missing appVersion')
  }
  
  if (!data.exportDate) {
    errors.push('Missing exportDate')
  }
  
  // Check required data arrays
  const requiredArrays = ['income', 'expenses', 'tasks', 'settings']
  for (const field of requiredArrays) {
    if (!Array.isArray(data[field])) {
      errors.push(`Missing or invalid ${field} array`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get list of changes between two schema versions
 */
export function getChangesSince(fromVersion: number, toVersion: number): string[] {
  const changes: string[] = []
  
  for (let v = fromVersion + 1; v <= toVersion; v++) {
    if (v in MIGRATIONS) {
      changes.push(`Schema ${v}: Migration available`)
    }
  }
  
  return changes
}

/**
 * Preview what would change during migration (for UI display)
 */
export function previewMigration(data: any): {
  currentVersion: number
  targetVersion: number
  willMigrate: boolean
  changes: string[]
} {
  const currentVersion = data.schemaVersion || 1
  
  return {
    currentVersion,
    targetVersion: CURRENT_SCHEMA_VERSION,
    willMigrate: currentVersion < CURRENT_SCHEMA_VERSION,
    changes: getChangesSince(currentVersion, CURRENT_SCHEMA_VERSION)
  }
}
