import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Refresh Access Token
 * Uses refresh token to get new access token
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export async function POST() {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      )
    }

    // Request new access token
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Token refresh failed:', errorData)
      throw new Error('Token refresh failed')
    }

    const tokens = await response.json()
    console.log('✅ Access token refreshed')

    // Calculate new expiry
    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Update access token cookie
    const isProduction = process.env.NODE_ENV === 'production'
    
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: tokens.expires_in,
      path: '/',
    })

    cookieStore.set('expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: tokens.expires_in,
      path: '/',
    })

    // If new refresh token provided (token rotation), update it
    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
      console.log('✅ Refresh token rotated')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    )
  }
}
