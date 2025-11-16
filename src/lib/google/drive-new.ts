/**
 * Google Drive API Service - Frontend (BFF Pattern)
 * 
 * Uses backend API routes for Drive operations
 * All tokens handled server-side (secure)
 */

import { BackupData } from '../sync/types'

/**
 * Upload backup to Google Drive
 * Uses backend API route
 */
export async function uploadBackup(data: BackupData): Promise<void> {
  try {
    console.log('📤 Uploading backup to Google Drive...')
    
    const response = await fetch('/api/drive/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    console.log('✅ Backup uploaded successfully')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

/**
 * Download backup from Google Drive
 * Uses backend API route
 */
export async function downloadBackup(): Promise<BackupData | null> {
  try {
    console.log('📥 Downloading backup from Google Drive...')
    
    const response = await fetch('/api/drive/download')

    if (response.status === 404) {
      console.log('No backup found on Google Drive')
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Download failed')
    }

    const { data } = await response.json()
    
    console.log('✅ Backup downloaded successfully')
    return data
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

/**
 * Delete backup from Google Drive (not implemented yet)
 */
export async function deleteBackup(): Promise<void> {
  // TODO: Implement when needed
  throw new Error('Delete not implemented yet')
}

/**
 * Get backup metadata (not implemented yet)
 */
export async function getBackupMetadata(): Promise<any> {
  // TODO: Implement when needed
  throw new Error('Metadata not implemented yet')
}
