/**
 * OAuth Callback Page
 * 
 * This page is no longer used - the callback is now handled by:
 * /api/auth/google/callback route
 * 
 * This file is kept for backwards compatibility but redirects to settings.
 */
export default function GoogleCallbackPage() {
  // Backend handles OAuth callback now
  // This page redirects to settings if accessed directly
  if (typeof window !== 'undefined') {
    window.location.href = '/settings'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting...
        </p>
      </div>
    </div>
  )
}
