/**
 * Auto-Sync Engine
 * 
 * Automatically syncs data to Google Drive when changes are detected.
 */

import { createBackup } from '../sync/backup-manager'
import { uploadBackup, downloadBackup } from './drive'
import { importBackup } from '../sync/import-manager'
import { isAuthorized } from './oauth'
import { DataEvents, DATA_EVENTS } from '../events'

// Sync state
let syncEnabled = false
let syncing = false
let lastSyncTime: number = 0
let syncTimer: NodeJS.Timeout | null = null

// Debounce settings
const SYNC_DEBOUNCE_MS = 30000 // 30 seconds after last change
const MIN_SYNC_INTERVAL_MS = 60000 // Minimum 1 minute between syncs

/**
 * Start auto-sync
 */
export function startAutoSync(): void {
  if (syncEnabled) {
    console.log('Auto-sync already running')
    return
  }

  if (!isAuthorized()) {
    console.warn('Cannot start auto-sync: Not authorized')
    return
  }

  syncEnabled = true
  console.log('✅ Auto-sync started')

  // Listen for data changes
  const dataEvents = [
    DATA_EVENTS.INCOME_CHANGED,
    DATA_EVENTS.EXPENSE_CHANGED,
    DATA_EVENTS.DEBT_CHANGED,
    DATA_EVENTS.TASK_CHANGED,
    DATA_EVENTS.REMINDER_CHANGED,
    DATA_EVENTS.WEIGHT_CHANGED,
    DATA_EVENTS.EXERCISE_CHANGED,
    DATA_EVENTS.MEAL_CHANGED,
    DATA_EVENTS.ROUTINE_CHANGED,
    DATA_EVENTS.SETTINGS_CHANGED,
  ]

  dataEvents.forEach(event => {
    DataEvents.on(event, handleDataChange)
  })

  // Initial sync on start
  scheduleSyncDebounced()
}

/**
 * Stop auto-sync
 */
export function stopAutoSync(): void {
  if (!syncEnabled) {
    return
  }

  syncEnabled = false
  console.log('⏸️ Auto-sync stopped')

  // Remove event listeners
  const dataEvents = [
    DATA_EVENTS.INCOME_CHANGED,
    DATA_EVENTS.EXPENSE_CHANGED,
    DATA_EVENTS.DEBT_CHANGED,
    DATA_EVENTS.TASK_CHANGED,
    DATA_EVENTS.REMINDER_CHANGED,
    DATA_EVENTS.WEIGHT_CHANGED,
    DATA_EVENTS.EXERCISE_CHANGED,
    DATA_EVENTS.MEAL_CHANGED,
    DATA_EVENTS.ROUTINE_CHANGED,
    DATA_EVENTS.SETTINGS_CHANGED,
  ]

  dataEvents.forEach(event => {
    DataEvents.off(event, handleDataChange)
  })

  // Clear pending sync
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
}

/**
 * Handle data change event
 */
function handleDataChange(): void {
  if (!syncEnabled || syncing) {
    return
  }

  console.log('📝 Data changed, scheduling sync...')
  scheduleSyncDebounced()
}

/**
 * Schedule sync with debouncing
 */
function scheduleSyncDebounced(): void {
  // Clear existing timer
  if (syncTimer) {
    clearTimeout(syncTimer)
  }

  // Schedule new sync
  syncTimer = setTimeout(() => {
    performSync()
  }, SYNC_DEBOUNCE_MS)
}

/**
 * Perform actual sync
 */
async function performSync(): Promise<void> {
  // Check if enough time has passed since last sync
  const timeSinceLastSync = Date.now() - lastSyncTime
  if (timeSinceLastSync < MIN_SYNC_INTERVAL_MS) {
    console.log(`⏳ Skipping sync (${Math.round(timeSinceLastSync / 1000)}s since last sync)`)
    return
  }

  if (syncing) {
    console.log('⏳ Sync already in progress')
    return
  }

  syncing = true
  console.log('🔄 Starting sync...')

  try {
    // Create local backup
    const localBackup = await createBackup()

    // Download from Drive
    const driveBackup = await downloadBackup()

    if (driveBackup) {
      // Merge with Drive backup
      console.log('🔀 Merging with Drive backup...')
      
      const result = await importBackup(driveBackup, {
        merge: true,
        preserveUnknown: true,
        skipDuplicates: true,
        validateSchema: true,
      })

      if (!result.success) {
        console.error('Merge failed:', result.message)
      }

      // Create new backup after merge
      const mergedBackup = await createBackup()
      await uploadBackup(mergedBackup)
    } else {
      // No backup on Drive, just upload
      console.log('📤 No Drive backup found, uploading...')
      await uploadBackup(localBackup)
    }

    lastSyncTime = Date.now()
    console.log('✅ Sync completed successfully')

    // Save last sync time to settings
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_sync_time', lastSyncTime.toString())
      
      // Emit sync complete event
      DataEvents.emit(DATA_EVENTS.SYNC_COMPLETED)
    }
  } catch (error) {
    console.error('❌ Sync failed:', error)
    
    // Emit sync error event
    if (typeof window !== 'undefined') {
      DataEvents.emit(DATA_EVENTS.SYNC_ERROR)
    }
  } finally {
    syncing = false
  }
}

/**
 * Trigger manual sync immediately
 */
export async function syncNow(): Promise<void> {
  if (syncing) {
    throw new Error('Sync already in progress')
  }

  if (!isAuthorized()) {
    throw new Error('Not authorized. Please connect Google Drive first.')
  }

  await performSync()
}

/**
 * Check if sync is in progress
 */
export function isSyncing(): boolean {
  return syncing
}

/**
 * Check if auto-sync is enabled
 */
export function isAutoSyncEnabled(): boolean {
  return syncEnabled
}

/**
 * Get last sync time
 */
export function getLastSyncTime(): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = localStorage.getItem('last_sync_time')
  return stored ? parseInt(stored) : null
}
