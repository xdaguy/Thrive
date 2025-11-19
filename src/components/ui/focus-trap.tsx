'use client'

import { useEffect, useRef } from 'react'
import { trapFocus, restoreFocus } from '@/lib/a11y'

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  onEscape?: () => void
}

/**
 * Focus trap component for modals and dialogs
 * Traps focus within the component and handles Escape key
 */
export function FocusTrap({ children, active = true, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const hasInitializedRef = useRef(false)
  const onEscapeRef = useRef(onEscape)

  // Keep onEscape ref updated without triggering re-renders
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active || !containerRef.current) {
      hasInitializedRef.current = false
      return
    }

    // Only store previous focus and initialize trap on first activation
    if (!hasInitializedRef.current) {
      // Store previously focused element only on first activation
      previousFocusRef.current = document.activeElement as HTMLElement
      hasInitializedRef.current = true
    }

    // Trap focus - don't auto-focus to avoid stealing focus from inputs
    const cleanup = trapFocus(containerRef.current, false)

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscapeRef.current) {
        onEscapeRef.current()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      cleanup()
      document.removeEventListener('keydown', handleEscape)
      // Restore focus when unmounting
      if (!active && previousFocusRef.current) {
        restoreFocus(previousFocusRef.current)
      }
    }
  }, [active]) // Removed onEscape from dependencies

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

