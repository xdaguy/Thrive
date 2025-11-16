/**
 * Google OAuth Service - Frontend (BFF Pattern)
 * 
 * Uses backend API routes for OAuth flow
 * Tokens stored in HTTP-only cookies (XSS-safe)
 */

/**
 * Start Google OAuth authorization
 * Redirects user to Google for authorization
 */
export async function authorizeWithGoogle(): Promise<void> {
  try {
    // Get auth URL from backend
    const response = await fetch('/api/auth/google/start')
    
    if (!response.ok) {
      throw new Error('Failed to start OAuth flow')
    }
    
    const { url } = await response.json()
    
    // Redirect to Google OAuth page
    window.location.href = url
  } catch (error) {
    console.error('Authorization failed:', error)
    throw error
  }
}

/**
 * Check if user is authorized
 * Returns authorization status from backend
 */
export async function isAuthorized(): Promise<boolean> {
  try {
    // Prevent cache to ensure fresh status
    const response = await fetch(`/api/auth/status?t=${Date.now()}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return false
    }
    
    const { authorized } = await response.json()
    return authorized
  } catch (error) {
    console.error('Failed to check auth status:', error)
    return false
  }
}

/**
 * Refresh access token if needed
 * Backend handles this automatically via cookies
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/status')
    
    if (!response.ok) {
      return false
    }
    
    const { needsRefresh } = await response.json()
    
    if (needsRefresh) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
      })
      
      return refreshResponse.ok
    }
    
    return true
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
}

/**
 * Sign out
 * Clears all auth cookies
 */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
    })
    
    // Reload page to clear state
    window.location.reload()
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

// Export legacy function names for compatibility
export const authorizeWithPopup = authorizeWithGoogle
export const clearTokens = signOut
