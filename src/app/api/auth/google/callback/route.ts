import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Google OAuth Callback Handler
 * Exchanges authorization code for tokens and stores in HTTP-only cookies
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID! // Server-side only (SECRET SAFE)
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET! // Server-side only (SECRET SAFE)
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=auth_failed', APP_URL)
    )
  }

  if (!code) {
    console.error('No authorization code received')
    return NextResponse.redirect(
      new URL('/settings?error=no_code', APP_URL)
    )
  }

  try {
    // Exchange code for tokens (SECRET STAYS ON SERVER - SAFE!)
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET, // ✅ Safe on server
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Token exchange failed:', errorData)
      throw new Error('Token exchange failed')
    }

    const tokens = await response.json()
    console.log('✅ Tokens received successfully')

    // Calculate expiry timestamp
    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Store tokens in HTTP-only cookies (XSS-safe!)
    const cookieStore = cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true, // Not accessible via JavaScript (XSS-safe)
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: tokens.expires_in, // Expires with token
      path: '/',
    })

    cookieStore.set('expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: tokens.expires_in,
      path: '/',
    })

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
      console.log('✅ Refresh token stored')
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL('/settings?connected=true', APP_URL)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=token_exchange', APP_URL)
    )
  }
}
