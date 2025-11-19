/**
 * Accessibility wrapper for toast notifications
 * Announces toasts to screen readers
 */
import { toast as sonnerToast } from 'sonner'
import { ScreenReader } from '@/lib/a11y'

/**
 * Accessible toast wrapper
 */
export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    ScreenReader.announceSuccess(message)
    return sonnerToast.success(message, options)
  },
  
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    ScreenReader.announceError(message)
    return sonnerToast.error(message, options)
  },
  
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    ScreenReader.announce(message)
    return sonnerToast.info(message, options)
  },
  
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    ScreenReader.announce(`Warning: ${message}`, 'assertive')
    return sonnerToast.warning(message, options)
  },
  
  // Re-export other toast methods
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
}

