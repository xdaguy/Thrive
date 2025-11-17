/**
 * Data Merge Utilities
 * 
 * Handles merging data from multiple sources, resolving conflicts by timestamp.
 */

import type { BackupData, MergeConflict } from './types'

/**
 * Merge two data sets by timestamp
 * Later timestamps win in case of conflicts
 */
export function mergeData(local: BackupData, remote: BackupData): BackupData {
  console.log('Merging local and remote data')
  
  return {
    // Use latest version info
    schemaVersion: Math.max(local.schemaVersion, remote.schemaVersion),
    appVersion: local.appVersion,
    minCompatibleVersion: Math.min(local.minCompatibleVersion, remote.minCompatibleVersion),
    
    // Use latest export metadata
    exportDate: new Date().toISOString(),
    deviceId: local.deviceId,
    deviceName: local.deviceName,
    
    // Merge features
    features: Array.from(new Set([...local.features, ...remote.features])),
    
    // Merge data tables
    income: mergeByTimestamp(local.income, remote.income),
    expenses: mergeByTimestamp(local.expenses, remote.expenses),
    debts: mergeByTimestamp(local.debts, remote.debts),
    tasks: mergeByTimestamp(local.tasks, remote.tasks),
    reminders: mergeByTimestamp(local.reminders, remote.reminders),
    weight: mergeByTimestamp(local.weight, remote.weight),
    exercise: mergeByTimestamp(local.exercise, remote.exercise),
    meals: mergeByTimestamp(local.meals, remote.meals),
    routines: mergeByTimestamp(local.routines, remote.routines),
    routineCompletions: mergeByTimestamp(local.routineCompletions, remote.routineCompletions),
    settings: mergeSettings(local.settings, remote.settings),
    
    // Calculate merged stats
    stats: calculateStats({
      income: mergeByTimestamp(local.income, remote.income),
      expenses: mergeByTimestamp(local.expenses, remote.expenses),
      debts: mergeByTimestamp(local.debts, remote.debts),
      tasks: mergeByTimestamp(local.tasks, remote.tasks),
      weight: mergeByTimestamp(local.weight, remote.weight),
      exercise: mergeByTimestamp(local.exercise, remote.exercise),
      meals: mergeByTimestamp(local.meals, remote.meals),
      routines: mergeByTimestamp(local.routines, remote.routines),
    }),
    
    // Preserve unknown fields from newer versions
    ...preserveUnknownFields(local, remote)
  }
}

/**
 * Merge arrays by timestamp, keeping latest version of each item
 */
function mergeByTimestamp<T extends { id?: string; updatedAt?: Date; createdAt?: Date }>(
  localItems: T[],
  remoteItems: T[]
): T[] {
  const merged = new Map<string, T>()
  
  // Add all local items
  for (const item of localItems) {
    if (item.id) {
      merged.set(item.id, item)
    }
  }
  
  // Merge remote items (newer timestamps win)
  for (const item of remoteItems) {
    if (!item.id) continue
    
    const existing = merged.get(item.id)
    
    if (!existing) {
      // New item from remote
      merged.set(item.id, item)
    } else {
      // Compare timestamps
      const existingTime = getTimestamp(existing)
      const remoteTime = getTimestamp(item)
      
      if (remoteTime > existingTime) {
        // Remote is newer
        merged.set(item.id, item)
      }
    }
  }
  
  return Array.from(merged.values())
}

/**
 * Get timestamp from item (try updatedAt, then createdAt)
 */
function getTimestamp(item: any): number {
  if (item.updatedAt) {
    return new Date(item.updatedAt).getTime()
  }
  if (item.createdAt) {
    return new Date(item.createdAt).getTime()
  }
  return 0
}

/**
 * Merge settings using timestamp-based conflict resolution
 * Latest updatedAt wins (same as other data types)
 */
function mergeSettings(localSettings: any[], remoteSettings: any[]): any[] {
  // Settings is a singleton, so we just need to compare the single item
  if (localSettings.length === 0) {
    return remoteSettings
  }
  
  if (remoteSettings.length === 0) {
    return localSettings
  }
  
  // Both exist - compare timestamps
  const localSetting = localSettings[0]
  const remoteSetting = remoteSettings[0]
  
  const localTime = getTimestamp(localSetting)
  const remoteTime = getTimestamp(remoteSetting)
  
  // Latest write wins
  if (remoteTime > localTime) {
    return remoteSettings
  }
  
  return localSettings
}

/**
 * Preserve unknown fields from future versions
 */
function preserveUnknownFields(local: any, remote: any): Record<string, any> {
  const knownFields = new Set([
    'schemaVersion', 'appVersion', 'minCompatibleVersion',
    'exportDate', 'deviceId', 'deviceName', 'features',
    'income', 'expenses', 'debts', 'tasks', 'reminders',
    'weight', 'exercise', 'meals', 'routines', 'routineCompletions',
    'settings', 'stats'
  ])
  
  const unknownFields: Record<string, any> = {}
  
  // Check remote for unknown fields (from newer version)
  for (const key of Object.keys(remote)) {
    if (!knownFields.has(key)) {
      unknownFields[key] = remote[key]
    }
  }
  
  // Check local for unknown fields
  for (const key of Object.keys(local)) {
    if (!knownFields.has(key) && !unknownFields[key]) {
      unknownFields[key] = local[key]
    }
  }
  
  return unknownFields
}

/**
 * Calculate statistics for backup data
 */
function calculateStats(data: any): BackupData['stats'] {
  const entriesByType: Record<string, number> = {}
  let totalEntries = 0
  let earliestDate: Date | null = null
  let latestDate: Date | null = null
  
  const tables = ['income', 'expenses', 'debts', 'tasks', 'weight', 'exercise', 'meals', 'routines']
  
  for (const table of tables) {
    const items = data[table] || []
    entriesByType[table] = items.length
    totalEntries += items.length
    
    // Track date range
    for (const item of items) {
      const date = item.date || item.createdAt
      if (date) {
        const d = new Date(date)
        if (!earliestDate || d < earliestDate) earliestDate = d
        if (!latestDate || d > latestDate) latestDate = d
      }
    }
  }
  
  return {
    totalEntries,
    entriesByType,
    dateRange: {
      earliest: earliestDate?.toISOString() || null,
      latest: latestDate?.toISOString() || null
    },
    size: {
      bytes: 0, // Will be calculated when stringified
      formatted: '0 KB'
    }
  }
}

/**
 * Detect merge conflicts
 */
export function detectConflicts(local: BackupData, remote: BackupData): MergeConflict[] {
  const conflicts: MergeConflict[] = []
  
  // Check each data type
  const types = ['income', 'expenses', 'debts', 'tasks', 'routines'] as const
  
  for (const type of types) {
    const localItems = local[type] || []
    const remoteItems = remote[type] || []
    
    // Build map of remote items
    const remoteMap = new Map()
    for (const item of remoteItems) {
      if (item.id) remoteMap.set(item.id, item)
    }
    
    // Check for conflicts
    for (const localItem of localItems) {
      if (!localItem.id) continue
      
      const remoteItem = remoteMap.get(localItem.id)
      if (!remoteItem) continue
      
      const localTime = getTimestamp(localItem)
      const remoteTime = getTimestamp(remoteItem)
      
      // If timestamps differ significantly (>1 second), it's a conflict
      if (Math.abs(localTime - remoteTime) > 1000) {
        conflicts.push({
          type,
          id: localItem.id,
          local: localItem,
          remote: remoteItem,
          timestamp: {
            local: new Date(localTime),
            remote: new Date(remoteTime)
          }
        })
      }
    }
  }
  
  return conflicts
}
