/**
 * Backup Manager
 * 
 * Handles creating and exporting backup data with proper versioning.
 */

import { db } from '../db/schema'
import { CURRENT_SCHEMA_VERSION, MIN_COMPATIBLE_VERSION, APP_VERSION } from './schema-version'
import { getDeviceId, getDeviceName } from './device-id'
import type { BackupData } from './types'

/**
 * Create a complete backup of all data
 */
export async function createBackup(): Promise<BackupData> {
  console.log('Creating backup with schema version', CURRENT_SCHEMA_VERSION)
  
  // Gather all data
  const income = await db.income.toArray()
  const expenses = await db.expenses.toArray()
  const debts = await db.debts.toArray()
  const tasks = await db.tasks.toArray()
  const reminders = await db.reminders.toArray()
  const weight = await db.weight.toArray()
  const exercise = await db.exercise.toArray()
  const meals = await db.meals.toArray()
  const routines = await db.routines.toArray()
  const routineCompletions = await db.routineCompletions.toArray()
  const settings = await db.settings.toArray()
  
  // Calculate statistics
  const totalEntries = 
    income.length + 
    expenses.length + 
    debts.length + 
    tasks.length + 
    reminders.length + 
    weight.length + 
    exercise.length + 
    meals.length + 
    routines.length + 
    routineCompletions.length
  
  // Find date range
  let earliestDate: Date | null = null
  let latestDate: Date | null = null
  
  const allDatedItems = [
    ...income.map(i => i.date),
    ...expenses.map(e => e.date),
    ...tasks.map(t => t.createdAt),
    ...weight.map(w => w.date),
    ...exercise.map(e => e.date),
    ...meals.map(m => m.date)
  ].filter(Boolean)
  
  if (allDatedItems.length > 0) {
    const dates = allDatedItems.map(d => new Date(d).getTime())
    earliestDate = new Date(Math.min(...dates))
    latestDate = new Date(Math.max(...dates))
  }
  
  const backup: BackupData = {
    // Version information
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    minCompatibleVersion: MIN_COMPATIBLE_VERSION,
    
    // Export metadata
    exportDate: new Date().toISOString(),
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    
    // Feature flags
    features: ['finance', 'tasks', 'health', 'routines'],
    
    // Data tables
    income,
    expenses,
    debts,
    tasks,
    reminders,
    weight,
    exercise,
    meals,
    routines,
    routineCompletions,
    settings,
    
    // Statistics
    stats: {
      totalEntries,
      entriesByType: {
        income: income.length,
        expenses: expenses.length,
        debts: debts.length,
        tasks: tasks.length,
        reminders: reminders.length,
        weight: weight.length,
        exercise: exercise.length,
        meals: meals.length,
        routines: routines.length,
        routineCompletions: routineCompletions.length
      },
      dateRange: {
        earliest: earliestDate?.toISOString() || null,
        latest: latestDate?.toISOString() || null
      },
      size: {
        bytes: 0, // Will be calculated after stringifying
        formatted: '0 KB'
      }
    }
  }
  
  return backup
}

/**
 * Export backup to JSON string
 */
export function exportBackupToJSON(backup: BackupData): string {
  const json = JSON.stringify(backup, null, 2)
  
  // Update size in backup
  const bytes = new Blob([json]).size
  backup.stats.size = {
    bytes,
    formatted: formatBytes(bytes)
  }
  
  return json
}

/**
 * Download backup as file
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backup = await createBackup()
    const json = exportBackupToJSON(backup)
    
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `thrive-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('Backup downloaded successfully')
  } catch (error) {
    console.error('Failed to download backup:', error)
    throw error
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get backup summary for display
 */
export async function getBackupSummary(): Promise<{
  totalEntries: number
  size: string
  lastBackup: string | null
}> {
  const backup = await createBackup()
  const json = exportBackupToJSON(backup)
  const bytes = new Blob([json]).size
  
  return {
    totalEntries: backup.stats.totalEntries,
    size: formatBytes(bytes),
    lastBackup: null // Will be tracked in future
  }
}
