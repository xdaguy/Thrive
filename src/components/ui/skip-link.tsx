'use client'

import { useEffect } from 'react'

/**
 * Skip link component for keyboard navigation
 * Allows users to skip to main content
 */
export function SkipLink() {
  useEffect(() => {
    // Initialize screen reader announcements
    if (typeof window !== 'undefined') {
      import('@/lib/a11y').then(({ ScreenReader }) => {
        ScreenReader.init()
      })
    }
  }, [])

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={(e) => {
        e.preventDefault()
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          mainContent.focus()
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
    >
      Skip to main content
    </a>
  )
}

