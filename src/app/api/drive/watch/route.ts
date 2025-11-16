import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

/**
 * Google Drive Watch API
 * 
 * Sets up push notifications for a Drive file
 * When the file changes, Google sends a webhook to our server
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const APP_FOLDER_NAME = 'Thrive App'
const BACKUP_FILENAME = 'thrive-backup.json'
const WEBHOOK_EXPIRATION_DAYS = 7 // Google max is 7 days

async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const expiresAt = cookieStore.get('expires_at')?.value
  
  if (!accessToken) return null
  
  if (expiresAt && Date.now() >= parseInt(expiresAt)) {
    const refreshResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/auth/refresh`, {
      method: 'POST',
    })
    
    if (!refreshResponse.ok) return null
    
    const newAccessToken = cookieStore.get('access_token')?.value
    return newAccessToken || null
  }
  
  return accessToken
}

async function findBackupFile(accessToken: string): Promise<string | null> {
  // Find app folder
  const folderResponse = await fetch(
    `${DRIVE_API_URL}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  const folderData = await folderResponse.json()
  if (!folderData.files || folderData.files.length === 0) {
    return null
  }

  const folderId = folderData.files[0].id

  // Find backup file
  const fileResponse = await fetch(
    `${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  const fileData = await fileResponse.json()
  if (!fileData.files || fileData.files.length === 0) {
    return null
  }

  return fileData.files[0].id
}

export async function POST(request: NextRequest) {
  try {
    logger.api('Setting up Drive watch')
    
    const accessToken = await getValidAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
    }

    // Find the backup file
    const fileId = await findBackupFile(accessToken)
    if (!fileId) {
      logger.warn('No backup file found to watch')
      return NextResponse.json({ error: 'No backup file found' }, { status: 404 })
    }

    // Generate unique channel ID
    const channelId = crypto.randomUUID()
    const channelToken = process.env.GOOGLE_WEBHOOK_TOKEN || crypto.randomUUID()
    
    // Calculate expiration (7 days max)
    const expiration = Date.now() + (WEBHOOK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000)
    
    // Webhook URL
    const webhookUrl = `${process.env.APP_URL}/api/drive/webhook`
    
    logger.api('Registering webhook', {
      fileId,
      channelId,
      webhookUrl,
      expiration: new Date(expiration).toISOString()
    })

    // Register webhook with Google
    const watchResponse = await fetch(
      `${DRIVE_API_URL}/files/${fileId}/watch`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          token: channelToken,
          expiration: expiration.toString(),
        }),
      }
    )

    if (!watchResponse.ok) {
      const error = await watchResponse.json()
      logger.error('Failed to register webhook', { error })
      throw new Error('Failed to register webhook')
    }

    const watchData = await watchResponse.json()
    
    logger.sync('Webhook registered successfully', {
      channelId: watchData.id,
      resourceId: watchData.resourceId,
      expiration: watchData.expiration
    })

    // Store watch info in cookie for renewal
    const cookieStore = cookies()
    cookieStore.set('drive_watch', JSON.stringify({
      channelId: watchData.id,
      resourceId: watchData.resourceId,
      expiration: watchData.expiration,
      fileId
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: WEBHOOK_EXPIRATION_DAYS * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      channelId: watchData.id,
      resourceId: watchData.resourceId,
      expiration: watchData.expiration
    })

  } catch (error) {
    logger.error('Watch setup failed', {}, error as Error)
    return NextResponse.json(
      { error: 'Failed to setup watch' },
      { status: 500 }
    )
  }
}

// Stop watching (unsubscribe)
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = await getValidAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
    }

    const cookieStore = cookies()
    const watchDataStr = cookieStore.get('drive_watch')?.value
    
    if (!watchDataStr) {
      return NextResponse.json({ error: 'No active watch found' }, { status: 404 })
    }

    const watchData = JSON.parse(watchDataStr)
    
    logger.api('Stopping Drive watch', {
      channelId: watchData.channelId,
      resourceId: watchData.resourceId
    })

    // Stop watching
    const stopResponse = await fetch(
      `${DRIVE_API_URL}/channels/stop`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: watchData.channelId,
          resourceId: watchData.resourceId
        }),
      }
    )

    if (!stopResponse.ok && stopResponse.status !== 404) {
      throw new Error('Failed to stop watch')
    }

    // Clear cookie
    cookieStore.delete('drive_watch')
    
    logger.sync('Webhook stopped successfully')

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Failed to stop watch', {}, error as Error)
    return NextResponse.json(
      { error: 'Failed to stop watch' },
      { status: 500 }
    )
  }
}
