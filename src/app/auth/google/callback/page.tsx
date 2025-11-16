'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * OAuth Callback Handler
 * 
 * This page receives the authorization code from Google.
 * Uses localStorage to communicate with parent window (works with COOP headers).
 */
export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'sending' | 'sent' | 'error'>('sending')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('🔵 Callback page loaded')
    console.log('Code:', code ? 'Present' : 'Missing')
    console.log('Error:', error || 'None')

    if (code) {
      console.log('📤 Writing GOOGLE_AUTH_SUCCESS to localStorage')
      
      // Use localStorage instead of postMessage (works with COOP)
      const authData = {
        type: 'GOOGLE_AUTH_SUCCESS',
        code,
        timestamp: Date.now()
      }
      
      localStorage.setItem('google_oauth_result', JSON.stringify(authData))
      
      setStatus('sent')
      
      // Close window after a short delay
      setTimeout(() => {
        console.log('🔵 Closing callback window')
        window.close()
      }, 500)
      
    } else if (error) {
      console.log('📤 Writing GOOGLE_AUTH_ERROR to localStorage')
      
      // Use localStorage for error too
      const authData = {
        type: 'GOOGLE_AUTH_ERROR',
        error: searchParams.get('error_description') || error,
        timestamp: Date.now()
      }
      
      localStorage.setItem('google_oauth_result', JSON.stringify(authData))
      
      setStatus('error')
      
      // Close window after a short delay
      setTimeout(() => {
        console.log('🔵 Closing callback window')
        window.close()
      }, 500)
    } else {
      console.error('❌ No code or error in callback')
      setStatus('error')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {status === 'sending' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Completing authorization...
            </p>
          </>
        )}
        
        {status === 'sent' && (
          <>
            <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Authorization successful! Connecting to Google Drive...
            </p>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close Window
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 dark:text-red-400 text-5xl mb-4">✗</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Authorization failed. You can close this window.
            </p>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  )
}
