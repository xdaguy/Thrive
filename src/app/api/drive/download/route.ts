import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Download Backup from Google Drive
 * Uses server-side tokens to download backup data
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const APP_FOLDER_NAME = 'Thrive App'
const BACKUP_FILENAME = 'thrive-backup.json'

async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const expiresAt = cookieStore.get('expires_at')?.value
  
  if (!accessToken) return null
  
  // Check if token is expired
  if (expiresAt && Date.now() >= parseInt(expiresAt)) {
    // Token expired, refresh it
    const refreshResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/auth/refresh`, {
      method: 'POST',
    })
    
    if (!refreshResponse.ok) {
      return null
    }
    
    // Get the new token
    const newAccessToken = cookieStore.get('access_token')?.value
    return newAccessToken || null
  }
  
  return accessToken
}

export async function GET() {
  try {
    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      )
    }

    // Find app folder
    const folderResponse = await fetch(
      `${DRIVE_API_URL}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const folderData = await folderResponse.json()
    
    if (!folderData.files || folderData.files.length === 0) {
      return NextResponse.json(
        { error: 'No backup found' },
        { status: 404 }
      )
    }

    const folderId = folderData.files[0].id

    // Find backup file
    const fileResponse = await fetch(
      `${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false&fields=files(id)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const fileData = await fileResponse.json()
    
    if (!fileData.files || fileData.files.length === 0) {
      return NextResponse.json(
        { error: 'No backup found' },
        { status: 404 }
      )
    }

    const fileId = fileData.files[0].id

    // Download file content
    const downloadResponse = await fetch(
      `${DRIVE_API_URL}/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!downloadResponse.ok) {
      throw new Error('Failed to download backup')
    }

    const backupData = await downloadResponse.json()
    
    console.log('✅ Backup downloaded from Google Drive')
    
    return NextResponse.json({ success: true, data: backupData })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    )
  }
}
