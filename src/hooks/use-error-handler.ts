'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { haptics } from '@/lib/haptics'

interface ErrorHandlerOptions {
  showToast?: boolean
  toastMessage?: string
  hapticFeedback?: boolean
  logContext?: Record<string, any>
}

/**
 * Custom hook for consistent error handling across the app
 * Provides standardized error handling with toast notifications,
 * logging, and haptic feedback
 */
export function useErrorHandler() {
  const handleError = useCallback((
    error: unknown,
    defaultMessage: string = 'An error occurred. Please try again.',
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastMessage,
      hapticFeedback = true,
      logContext = {}
    } = options

    // Extract error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : defaultMessage

    // Log error
    logger.error(
      toastMessage || defaultMessage,
      logContext,
      error instanceof Error ? error : new Error(String(error))
    )

    // Show toast notification
    if (showToast) {
      toast.error(toastMessage || errorMessage)
    }

    // Haptic feedback
    if (hapticFeedback) {
      haptics.error()
    }

    // Return error for further handling if needed
    return error
  }, [])

  return { handleError }
}

