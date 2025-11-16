'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * OAuth Callback Handler
 * 
 * This page receives the authorization code from Google and sends it to the parent window.
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
    console.log('window.opener:', window.opener ? 'Present' : 'Missing')

    if (window.opener) {
      if (code) {
        console.log('📤 Sending GOOGLE_AUTH_SUCCESS to parent')
        // Send code to parent window
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            code,
          },
          window.location.origin
        )
        
        setStatus('sent')
        
        // Close window after a short delay
        setTimeout(() => {
          console.log('🔵 Closing callback window')
          window.close()
        }, 500)
        
      } else if (error) {
        console.log('📤 Sending GOOGLE_AUTH_ERROR to parent')
        // Send error to parent window
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: searchParams.get('error_description') || error,
          },
          window.location.origin
        )
        
        setStatus('error')
        
        // Close window after a short delay
        setTimeout(() => {
          console.log('🔵 Closing callback window')
          window.close()
        }, 500)
      }
    } else {
      console.error('❌ No window.opener found!')
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
              Authorization successful! This window will close automatically...
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
