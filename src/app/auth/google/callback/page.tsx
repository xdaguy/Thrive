'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * OAuth Callback Handler
 * 
 * This page receives the authorization code from Google and sends it to the parent window.
 */
export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (window.opener) {
      if (code) {
        // Send code to parent window
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            code,
          },
          window.location.origin
        )
      } else if (error) {
        // Send error to parent window
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: searchParams.get('error_description') || error,
          },
          window.location.origin
        )
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Completing authorization...
        </p>
      </div>
    </div>
  )
}
