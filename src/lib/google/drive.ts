/**
 * Google Drive API Service
 * 
 * Handles file operations on Google Drive.
 */

import { getValidAccessToken, loadTokens } from './oauth'
import type { BackupData } from '../sync/types'

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3'
const BACKUP_FILENAME = 'thrive-backup.json'
const FOLDER_NAME = 'Thrive App'

/**
 * Get or create app folder in Drive
 */
async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  // Search for existing folder
  const searchResponse = await fetch(
    `${DRIVE_API_URL}/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!searchResponse.ok) {
    throw new Error('Failed to search for app folder')
  }

  const searchData = await searchResponse.json()

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  // Create folder if it doesn't exist
  const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })

  if (!createResponse.ok) {
    throw new Error('Failed to create app folder')
  }

  const createData = await createResponse.json()
  return createData.id
}

/**
 * Get backup file ID from Drive
 */
async function getBackupFileId(accessToken: string, folderId: string): Promise<string | null> {
  const response = await fetch(
    `${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to search for backup file')
  }

  const data = await response.json()
  return data.files && data.files.length > 0 ? data.files[0].id : null
}

/**
 * Upload backup to Google Drive
 */
export async function uploadBackup(backup: BackupData): Promise<void> {
  const tokens = loadTokens()
  if (!tokens) {
    throw new Error('Not authorized. Please connect Google Drive first.')
  }

  const accessToken = await getValidAccessToken(tokens)
  const folderId = await getOrCreateAppFolder(accessToken)
  const existingFileId = await getBackupFileId(accessToken, folderId)

  const backupJson = JSON.stringify(backup, null, 2)
  const blob = new Blob([backupJson], { type: 'application/json' })

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    parents: [folderId],
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', blob)

  let url = `${UPLOAD_URL}/files?uploadType=multipart`
  let method = 'POST'

  if (existingFileId) {
    // Update existing file
    url = `${UPLOAD_URL}/files/${existingFileId}?uploadType=multipart`
    method = 'PATCH'
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to upload backup to Drive')
  }

  console.log('✅ Backup uploaded to Google Drive')
}

/**
 * Download backup from Google Drive
 */
export async function downloadBackup(): Promise<BackupData | null> {
  const tokens = loadTokens()
  if (!tokens) {
    throw new Error('Not authorized. Please connect Google Drive first.')
  }

  const accessToken = await getValidAccessToken(tokens)
  const folderId = await getOrCreateAppFolder(accessToken)
  const fileId = await getBackupFileId(accessToken, folderId)

  if (!fileId) {
    console.log('No backup found on Google Drive')
    return null
  }

  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to download backup from Drive')
  }

  const data = await response.json()
  console.log('✅ Backup downloaded from Google Drive')
  return data
}

/**
 * Delete backup from Google Drive
 */
export async function deleteBackup(): Promise<void> {
  const tokens = loadTokens()
  if (!tokens) {
    throw new Error('Not authorized. Please connect Google Drive first.')
  }

  const accessToken = await getValidAccessToken(tokens)
  const folderId = await getOrCreateAppFolder(accessToken)
  const fileId = await getBackupFileId(accessToken, folderId)

  if (!fileId) {
    console.log('No backup found on Google Drive')
    return
  }

  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete backup from Drive')
  }

  console.log('✅ Backup deleted from Google Drive')
}

/**
 * Get backup metadata (without downloading full file)
 */
export async function getBackupMetadata(): Promise<{
  exists: boolean
  modifiedTime?: string
  size?: number
} | null> {
  const tokens = loadTokens()
  if (!tokens) {
    return null
  }

  try {
    const accessToken = await getValidAccessToken(tokens)
    const folderId = await getOrCreateAppFolder(accessToken)
    
    const response = await fetch(
      `${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false&fields=files(id,modifiedTime,size)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.files && data.files.length > 0) {
      const file = data.files[0]
      return {
        exists: true,
        modifiedTime: file.modifiedTime,
        size: parseInt(file.size),
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Failed to get backup metadata:', error)
    return null
  }
}
