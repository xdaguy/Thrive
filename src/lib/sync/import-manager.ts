/**
 * Import Manager
 * 
 * Handles importing and restoring backup data with migration support.
 */

import { db } from '../db/schema'
import { migrateData, validateDataStructure } from './migrations'
import { mergeData } from './merge'
import { createBackup } from './backup-manager'
import { isCompatible, isNewerVersion } from './schema-version'
import { DataEvents, DATA_EVENTS } from '../events'
import type { BackupData, ImportOptions, ImportResult } from './types'

/**
 * Import backup data
 */
export async function importBackup(
  data: any,
  options: ImportOptions = {
    merge: true,
    preserveUnknown: true,
    skipDuplicates: true,
    validateSchema: true
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    message: '',
    stats: {
      imported: 0,
      skipped: 0,
      errors: 0
    },
    warnings: []
  }
  
  try {
    // Step 1: Validate data structure
    if (options.validateSchema) {
      const validation = validateDataStructure(data)
      if (!validation.valid) {
        result.message = 'Invalid backup file format'
        result.warnings = validation.errors
        return result
      }
    }
    
    // Step 2: Check compatibility
    if (!isCompatible(data.schemaVersion)) {
      result.message = `Incompatible schema version ${data.schemaVersion}`
      result.warnings.push('This backup is from an incompatible version')
      return result
    }
    
    // Step 3: Warn if from newer version
    if (isNewerVersion(data.schemaVersion)) {
      result.warnings.push(
        `This backup was created with a newer version (schema ${data.schemaVersion}). ` +
        `Some features may not be available.`
      )
    }
    
    // Step 4: Migrate data if needed
    const migratedData = migrateData(data)
    
    // Step 5: Merge with existing data if requested
    let finalData: BackupData
    if (options.merge) {
      const localData = await createBackup()
      finalData = mergeData(localData, migratedData)
      result.warnings.push('Data merged with existing entries')
    } else {
      finalData = migratedData
      result.warnings.push('Existing data will be replaced')
    }
    
    // Step 6: Clear existing data if not merging
    if (!options.merge) {
      await clearAllData()
    }
    
    // Step 7: Import data
    const importStats = await importData(finalData, options.skipDuplicates)
    result.stats = importStats
    
    // Step 8: Emit data change events to refresh charts and UI
    if (importStats.imported > 0) {
      DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
      DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
      DataEvents.emit(DATA_EVENTS.DEBT_CHANGED)
      DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
      DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
      DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
      DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
      DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
      DataEvents.emit(DATA_EVENTS.ROUTINE_COMPLETION_CHANGED)
      DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
    }
    
    result.success = true
    result.message = `Successfully imported ${importStats.imported} entries`
    
    return result
  } catch (error) {
    console.error('Import failed:', error)
    result.message = error instanceof Error ? error.message : 'Import failed'
    result.stats.errors++
    return result
  }
}

/**
 * Import data into database
 */
async function importData(
  data: BackupData,
  skipDuplicates: boolean
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0
  let skipped = 0
  let errors = 0
  
  try {
    // Import income
    const incomeResult = await importTable(db.income, data.income, skipDuplicates)
    imported += incomeResult.imported
    skipped += incomeResult.skipped
    
    // Import expenses
    const expenseResult = await importTable(db.expenses, data.expenses, skipDuplicates)
    imported += expenseResult.imported
    skipped += expenseResult.skipped
    
    // Import debts
    const debtResult = await importTable(db.debts, data.debts, skipDuplicates)
    imported += debtResult.imported
    skipped += debtResult.skipped
    
    // Import tasks
    const taskResult = await importTable(db.tasks, data.tasks, skipDuplicates)
    imported += taskResult.imported
    skipped += taskResult.skipped
    
    // Import reminders
    const reminderResult = await importTable(db.reminders, data.reminders, skipDuplicates)
    imported += reminderResult.imported
    skipped += reminderResult.skipped
    
    // Import weight
    const weightResult = await importTable(db.weight, data.weight, skipDuplicates)
    imported += weightResult.imported
    skipped += weightResult.skipped
    
    // Import exercise
    const exerciseResult = await importTable(db.exercise, data.exercise, skipDuplicates)
    imported += exerciseResult.imported
    skipped += exerciseResult.skipped
    
    // Import meals
    const mealResult = await importTable(db.meals, data.meals, skipDuplicates)
    imported += mealResult.imported
    skipped += mealResult.skipped
    
    // Import routines
    const routineResult = await importTable(db.routines, data.routines, skipDuplicates)
    imported += routineResult.imported
    skipped += routineResult.skipped
    
    // Import routine completions
    const completionResult = await importTable(db.routineCompletions, data.routineCompletions, skipDuplicates)
    imported += completionResult.imported
    skipped += completionResult.skipped
    
    // Import settings (always replace, never skip)
    if (data.settings && data.settings.length > 0) {
      for (const setting of data.settings) {
        if (setting.id) {
          await db.settings.put(setting)
          imported++
        }
      }
    }
    
  } catch (error) {
    console.error('Error importing data:', error)
    errors++
  }
  
  return { imported, skipped, errors }
}

/**
 * Import a single table with duplicate handling
 */
async function importTable<T extends { id?: string }>(
  table: any,
  items: T[],
  skipDuplicates: boolean
): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0
  
  if (!items || items.length === 0) {
    return { imported, skipped }
  }
  
  for (const item of items) {
    if (!item.id) continue
    
    try {
      if (skipDuplicates) {
        const existing = await table.get(item.id)
        if (existing) {
          skipped++
          continue
        }
      }
      
      await table.put(item)
      imported++
    } catch (error) {
      console.error('Error importing item:', error)
      skipped++
    }
  }
  
  return { imported, skipped }
}

/**
 * Clear all data from database
 */
async function clearAllData(): Promise<void> {
  await db.income.clear()
  await db.expenses.clear()
  await db.debts.clear()
  await db.tasks.clear()
  await db.reminders.clear()
  await db.weight.clear()
  await db.exercise.clear()
  await db.meals.clear()
  await db.routines.clear()
  await db.routineCompletions.clear()
  // Don't clear settings
}

/**
 * Restore from backup file (for full restore, not merge)
 */
export async function restoreFromBackup(data: any): Promise<ImportResult> {
  return importBackup(data, {
    merge: false,
    preserveUnknown: true,
    skipDuplicates: false,
    validateSchema: true
  })
}

/**
 * Parse backup file
 */
export async function parseBackupFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
