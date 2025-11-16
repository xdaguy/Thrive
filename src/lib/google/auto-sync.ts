/**
 * Auto-Sync Engine
 * 
 * Automatically syncs data to Google Drive when changes are detected.
 */

import { createBackup } from '../sync/backup-manager'
import { uploadBackup, downloadBackup } from './drive-new'
import { importBackup } from '../sync/import-manager'
import { isAuthorized } from './oauth-new'
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
 * @param triggerImmediateSync - If true, performs immediate sync instead of debounced (useful on first connection)
 */
export async function startAutoSync(triggerImmediateSync = false): Promise<void> {
  console.log('🚀 startAutoSync() called, immediate:', triggerImmediateSync)
  
  if (syncEnabled) {
    console.log('⚠️ Auto-sync already running')
    return
  }

  if (!(await isAuthorized())) {
    console.warn('⚠️ Cannot start auto-sync: Not authorized')
    return
  }

  syncEnabled = true
  console.log('✅ Auto-sync enabled')

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
  console.log('✓ Event listeners registered for', dataEvents.length, 'events')

  // Initial sync - immediate if just connected, debounced if page reload
  if (triggerImmediateSync) {
    console.log('📅 Triggering immediate initial sync...')
    performSync().catch(err => console.error('Initial sync failed:', err))
  } else {
    console.log('📅 Scheduling initial sync...')
    scheduleSyncDebounced()
  }
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
  console.log('🟢 performSync() started')
  
  // Check if still authorized
  if (!(await isAuthorized())) {
    console.log('⚠️ Not authorized, stopping sync')
    stopAutoSync()
    return
  }
  console.log('✓ Authorization check passed')

  // Check if enough time has passed since last sync
  const timeSinceLastSync = Date.now() - lastSyncTime
  if (timeSinceLastSync < MIN_SYNC_INTERVAL_MS && lastSyncTime > 0) {
    console.log(`⏳ Skipping sync (${Math.round(timeSinceLastSync / 1000)}s since last sync, minimum ${MIN_SYNC_INTERVAL_MS / 1000}s)`)
    return
  }
  console.log('✓ Interval check passed')

  if (syncing) {
    console.log('⏳ Sync already in progress')
    return
  }

  syncing = true
  console.log('🔄 Starting sync... (syncing flag set to true)')

  try {
    // Create local backup
    console.log('📦 Creating local backup...')
    const localBackup = await createBackup()
    console.log('✓ Local backup created:', localBackup.stats)

    // Download from Drive
    console.log('📥 Downloading from Drive...')
    const driveBackup = await downloadBackup()

    if (driveBackup) {
      console.log('✓ Drive backup found, merging...')
      // Merge with Drive backup
      console.log('🔀 Merging with Drive backup...')
      
      const result = await importBackup(driveBackup, {
        merge: true,
        preserveUnknown: true,
        skipDuplicates: true,
        validateSchema: true,
      })

      if (!result.success) {
        console.error('❌ Merge failed:', result.message)
        throw new Error('Merge failed: ' + result.message)
      }
      console.log('✓ Merge successful')

      // Create new backup after merge
      console.log('📦 Creating merged backup...')
      const mergedBackup = await createBackup()
      console.log('✓ Merged backup created')
      
      console.log('📤 Uploading merged backup to Drive...')
      await uploadBackup(mergedBackup)
      console.log('✓ Upload complete')
    } else {
      // No backup on Drive, just upload
      console.log('📤 No Drive backup found, uploading local backup...')
      await uploadBackup(localBackup)
      console.log('✓ Upload complete')
    }

    lastSyncTime = Date.now()
    console.log('✅ Sync completed successfully at', new Date(lastSyncTime).toLocaleTimeString())

    // Save last sync time to settings
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_sync_time', lastSyncTime.toString())
      console.log('✓ Last sync time saved to localStorage:', lastSyncTime)
      
      // Emit sync complete event
      DataEvents.emit(DATA_EVENTS.SYNC_COMPLETED)
      console.log('✓ SYNC_COMPLETED event emitted')
    }
  } catch (error) {
    console.error('❌ Sync failed with error:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    
    // Emit sync error event
    if (typeof window !== 'undefined') {
      DataEvents.emit(DATA_EVENTS.SYNC_ERROR)
    }
    
    // Re-throw error so caller knows it failed
    throw error
  } finally {
    syncing = false
    console.log('🟢 performSync() ended (syncing flag set to false)')
  }
}

/**
 * Trigger manual sync immediately
 */
export async function syncNow(): Promise<void> {
  console.log('🔵 syncNow() called')
  
  if (syncing) {
    throw new Error('Sync already in progress')
  }

  if (!(await isAuthorized())) {
    throw new Error('Not authorized. Please connect Google Drive first.')
  }

  console.log('🔵 Authorization check passed, calling performSync()')
  
  // Reset minimum interval check for manual sync
  const timeSinceLastSync = Date.now() - lastSyncTime
  if (timeSinceLastSync < MIN_SYNC_INTERVAL_MS) {
    console.log(`⚠️ Ignoring minimum interval for manual sync (${Math.round(timeSinceLastSync / 1000)}s since last sync)`)
    lastSyncTime = 0 // Reset to allow immediate sync
  }
  
  await performSync()
  
  console.log('🔵 syncNow() completed')
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
