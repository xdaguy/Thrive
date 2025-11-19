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

  useEffect(() => {
    if (!active || !containerRef.current) return

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Trap focus
    const cleanup = trapFocus(containerRef.current)

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      cleanup()
      document.removeEventListener('keydown', handleEscape)
      // Restore focus when unmounting
      if (previousFocusRef.current) {
        restoreFocus(previousFocusRef.current)
      }
    }
  }, [active, onEscape])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

