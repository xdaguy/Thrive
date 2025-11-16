/**
 * Sync System - Main Export
 * 
 * Central export point for all sync-related functionality.
 */

// Schema versioning
export {
  CURRENT_SCHEMA_VERSION,
  MIN_COMPATIBLE_VERSION,
  APP_VERSION,
  getSchemaInfo,
  isCompatible,
  needsMigration,
  isNewerVersion,
  type SchemaVersionInfo
} from './schema-version'

// Types
export type {
  BackupData,
  BackupStats,
  SyncMetadata,
  ImportOptions,
  ImportResult,
  MergeConflict
} from './types'

// Backup management
export {
  createBackup,
  exportBackupToJSON,
  downloadBackup,
  getBackupSummary
} from './backup-manager'

// Import management
export {
  importBackup,
  restoreFromBackup,
  parseBackupFile
} from './import-manager'

// Migrations
export {
  migrateData,
  validateDataStructure,
  getChangesSince,
  previewMigration
} from './migrations'

// Device identification
export {
  getDeviceId,
  getDeviceName,
  setDeviceName,
  getDeviceInfo
} from './device-id'

// Data merging
export {
  mergeData,
  detectConflicts
} from './merge'
