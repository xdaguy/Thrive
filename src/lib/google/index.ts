/**
 * Google Services - Main Export
 * 
 * Central export point for all Google-related functionality.
 */

// OAuth
export {
  authorizeWithPopup,
  isAuthorized,
  loadTokens,
  clearTokens,
  saveTokens,
  type GoogleTokens,
} from './oauth'

// Drive API
export {
  uploadBackup,
  downloadBackup,
  deleteBackup,
  getBackupMetadata,
} from './drive'

// Auto-sync
export {
  startAutoSync,
  stopAutoSync,
  syncNow,
  isSyncing,
  isAutoSyncEnabled,
  getLastSyncTime,
} from './auto-sync'
