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
    
    const hasTokens = !!(accessToken && refreshToken)
    const isExpired = expiresAt ? Date.now() >= parseInt(expiresAt.value) : true
    
    return NextResponse.json({
      authorized: hasTokens,
      needsRefresh: hasTokens && isExpired
    })
  } catch (error) {
    console.error('Failed to check auth status:', error)
    return NextResponse.json({
      authorized: false,
      needsRefresh: false
    })
  }
}
