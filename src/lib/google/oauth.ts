/**
 * Google OAuth Service
 * 
 * Handles Google OAuth 2.0 authentication flow for Drive API access.
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  expires_at: number // Calculated timestamp
}

/**
 * Generate authorization URL for Google OAuth
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent to ensure refresh token
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Open Google OAuth popup and handle authorization
 */
export async function authorizeWithPopup(): Promise<GoogleTokens> {
  return new Promise((resolve, reject) => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      getAuthorizationUrl(),
      'Google Authorization',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    if (!popup) {
      reject(new Error('Failed to open authorization popup. Please allow popups.'))
      return
    }

    // Listen for callback
    const messageHandler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler)
        popup.close()

        try {
          const tokens = await exchangeCodeForTokens(event.data.code)
          resolve(tokens)
        } catch (error) {
          reject(error)
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler)
        popup.close()
        reject(new Error(event.data.error || 'Authorization failed'))
      }
    }

    window.addEventListener('message', messageHandler)

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        reject(new Error('Authorization cancelled'))
      }
    }, 1000)
  })
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Failed to exchange code for tokens')
  }

  const data = await response.json()
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Failed to refresh token')
  }

  const data = await response.json()
  
  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Keep existing refresh token
    expires_in: data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
    expires_at: Date.now() + data.expires_in * 1000,
  }
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(tokens: GoogleTokens): boolean {
  // Add 5 minute buffer
  return Date.now() >= tokens.expires_at - 5 * 60 * 1000
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(tokens: GoogleTokens): Promise<string> {
  if (!isTokenExpired(tokens)) {
    return tokens.access_token
  }

  if (!tokens.refresh_token) {
    throw new Error('No refresh token available. Please re-authorize.')
  }

  const newTokens = await refreshAccessToken(tokens.refresh_token)
  
  // Save new tokens to localStorage
  localStorage.setItem('google_tokens', JSON.stringify(newTokens))
  
  return newTokens.access_token
}

/**
 * Save tokens to localStorage
 */
export function saveTokens(tokens: GoogleTokens): void {
  localStorage.setItem('google_tokens', JSON.stringify(tokens))
}

/**
 * Load tokens from localStorage
 */
export function loadTokens(): GoogleTokens | null {
  const stored = localStorage.getItem('google_tokens')
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem('google_tokens')
}

/**
 * Check if user is authorized
 */
export function isAuthorized(): boolean {
  const tokens = loadTokens()
  return tokens !== null && tokens.refresh_token !== undefined
}
