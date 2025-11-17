import { useState, useRef, useCallback } from 'react'
import { haptics } from '@/lib/haptics'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 150
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start pull if at top of scroll
    const container = containerRef.current
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return

    const container = containerRef.current
    if (!container || container.scrollTop > 0) {
      setIsPulling(false)
      setPullDistance(0)
      return
    }

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current

    if (distance > 0) {
      // Apply resistance as user pulls further
      const resistance = 0.5
      const adjustedDistance = Math.min(distance * resistance, maxPull)
      setPullDistance(adjustedDistance)

      // Haptic feedback when reaching threshold
      if (adjustedDistance >= threshold && pullDistance < threshold) {
        haptics.light()
      }
    }
  }, [isPulling, isRefreshing, pullDistance, threshold, maxPull])

  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      haptics.medium()

      try {
        await onRefresh()
        haptics.success()
      } catch (error) {
        haptics.error()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  const pullHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const showRefreshIndicator = pullDistance > 0

  return {
    containerRef,
    pullHandlers,
    pullDistance,
    pullProgress,
    isRefreshing,
    showRefreshIndicator
  }
}
