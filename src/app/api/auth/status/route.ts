import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Check OAuth Status
 * Returns whether user is authorized
 */

export async function GET() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('access_token')
    const refreshToken = cookieStore.get('refresh_token')
    const expiresAt = cookieStore.get('expires_at')
    
    // User is authorized if they have at least an access token
    // Refresh token might not be present on re-authorization (Google behavior)
    const hasAccessToken = !!accessToken
    const hasRefreshToken = !!refreshToken
    const isExpired = expiresAt ? Date.now() >= parseInt(expiresAt.value) : true
    
    // Authorized if we have access token OR refresh token
    const authorized = hasAccessToken || hasRefreshToken
    
    // Need refresh if we have tokens but access token is expired
    const needsRefresh = authorized && isExpired && hasRefreshToken
    
    console.log('🔍 Auth status check:', {
      hasAccessToken,
      hasRefreshToken,
      isExpired,
      authorized,
      needsRefresh
    })
    
    return NextResponse.json({
      authorized,
      needsRefresh
    })
  } catch (error) {
    console.error('Failed to check auth status:', error)
    return NextResponse.json({
      authorized: false,
      needsRefresh: false
    })
  }
}
