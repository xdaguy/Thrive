'use client'

import { useCallback } from 'react'

/**
 * Hook to ensure minimum loading time for better UX
 * Prevents flickering when data loads too quickly
 */
export function useMinimumLoadingTime() {
  const ensureMinimumTime = useCallback(async <T,>(
    promise: Promise<T>,
    minMs: number = 300
  ): Promise<T> => {
    const startTime = Date.now()
    const result = await promise
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minMs - elapsedTime)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
    return result
  }, [])

  return { ensureMinimumTime }
}

