import { NextResponse } from 'next/server'

/**
 * Start Google OAuth Flow
 * Returns the authorization URL for the frontend to redirect to
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID! // Server-side only (no NEXT_PUBLIC_)
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
]

export async function GET() {
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline', // Get refresh token
      prompt: 'consent', // Force consent to ensure refresh token
    })

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`
    
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Failed to generate auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    )
  }
}
