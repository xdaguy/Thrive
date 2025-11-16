import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter'

/**
 * Upload Backup to Google Drive
 * Uses server-side tokens to upload backup data
 * Rate limited to prevent abuse
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3'
const APP_FOLDER_NAME = 'Thrive App'
const BACKUP_FILENAME = 'thrive-backup.json'

async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const expiresAt = cookieStore.get('expires_at')?.value
  
  console.log('🔍 Checking cookies:', {
    hasAccessToken: !!accessToken,
    hasExpiresAt: !!expiresAt,
    isExpired: expiresAt ? Date.now() >= parseInt(expiresAt) : 'unknown'
  })
  
  if (!accessToken) {
    console.log('❌ No access token in cookies')
    return null
  }
  
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

async function findOrCreateAppFolder(accessToken: string): Promise<string> {
  // Search for existing folder
  const searchResponse = await fetch(
    `${DRIVE_API_URL}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`,
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

  // Create new folder
  const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })

  if (!createResponse.ok) {
    throw new Error('Failed to create app folder')
  }

  const folderData = await createResponse.json()
  return folderData.id
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 60 uploads per hour
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit({
      identifier: `upload:${identifier}`,
      maxRequests: 60,
      windowMs: 60 * 60 * 1000 // 1 hour
    })
    
    if (!rateLimit.allowed) {
      console.warn('⚠️ Upload rate limit exceeded for:', identifier)
      return NextResponse.json(
        { 
          error: 'Too many uploads. Please try again later.',
          retry_after: rateLimit.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '3600'
          }
        }
      )
    }
    
    console.log('📤 Upload route called')
    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      console.error('❌ No access token found in cookies')
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 401 }
      )
    }
    
    console.log('✅ Access token found')

    const { data } = await request.json()
    
    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    // Find or create app folder
    const folderId = await findOrCreateAppFolder(accessToken)

    // Check if backup file already exists
    const searchResponse = await fetch(
      `${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false&fields=files(id)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const searchData = await searchResponse.json()
    const fileId = searchData.files?.[0]?.id

    // Prepare multipart upload
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      ...(fileId ? {} : { parents: [folderId] }),
    }

    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelimiter = `\r\n--${boundary}--`

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(data) +
      closeDelimiter

    // Upload or update file
    const uploadUrl = fileId
      ? `${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=multipart`
      : `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`

    const uploadResponse = await fetch(uploadUrl, {
      method: fileId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload backup')
    }

    const result = await uploadResponse.json()
    
    console.log('✅ Backup uploaded to Google Drive')
    
    return NextResponse.json({ success: true, fileId: result.id })
  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Failed to upload backup', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
