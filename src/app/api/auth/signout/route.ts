import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Sign Out
 * Clears all auth cookies
 */

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Clear all auth cookies
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    cookieStore.delete('expires_at')
    cookieStore.delete('token_family')
    cookieStore.delete('google_user_email')
    
    console.log('✅ User signed out, cookies cleared')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}
