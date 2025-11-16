import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Enhanced Token Rotation with Reuse Detection
 * 
 * This endpoint handles refresh token rotation with security features:
 * - Tracks token families
 * - Detects token reuse (stolen tokens)
 * - Invalidates entire family on suspicious activity
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

interface TokenFamily {
  familyId: string
  generation: number
  createdAt: number
}

export async function POST() {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    const familyDataStr = cookieStore.get('token_family')?.value

    if (!refreshToken) {
      console.error('❌ No refresh token available')
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      )
    }

    // Parse token family data
    let familyData: TokenFamily | null = null
    if (familyDataStr) {
      try {
        familyData = JSON.parse(familyDataStr)
      } catch (e) {
        console.warn('⚠️ Failed to parse token family data')
      }
    }

    // Initialize family if not exists
    if (!familyData) {
      familyData = {
        familyId: crypto.randomUUID(),
        generation: 0,
        createdAt: Date.now()
      }
      console.log('🆕 Initialized new token family:', familyData.familyId)
    }

    console.log('🔄 Refreshing token (Family:', familyData.familyId, 'Generation:', familyData.generation, ')')

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
      console.error('❌ Token refresh failed:', errorData)
      
      // Check if token was revoked or invalid
      if (errorData.error === 'invalid_grant') {
        console.error('🚨 SECURITY ALERT: Token may have been reused or revoked!')
        
        // Clear all auth cookies (invalidate family)
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')
        cookieStore.delete('expires_at')
        cookieStore.delete('token_family')
        
        return NextResponse.json(
          { error: 'Token revoked or reused. Please re-authenticate.', reauth_required: true },
          { status: 401 }
        )
      }
      
      throw new Error('Token refresh failed')
    }

    const tokens = await response.json()
    console.log('✅ Access token refreshed')

    // Calculate new expiry
    const expiresAt = Date.now() + tokens.expires_in * 1000
    const isProduction = process.env.NODE_ENV === 'production'

    // Increment generation (track rotation)
    const newFamilyData: TokenFamily = {
      ...familyData,
      generation: familyData.generation + 1
    }

    // Update access token cookie
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
      console.log('🔄 Refresh token rotated (Generation:', newFamilyData.generation, ')')
      
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
    }

    // Update token family tracking
    cookieStore.set('token_family', JSON.stringify(newFamilyData), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    console.log('✅ Token rotation complete (Family:', newFamilyData.familyId, 'Generation:', newFamilyData.generation, ')')

    return NextResponse.json({ 
      success: true,
      generation: newFamilyData.generation
    })
  } catch (error) {
    console.error('❌ Token rotation error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    )
  }
}
