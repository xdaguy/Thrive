'use client'

import { useEffect } from 'react'

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      let refreshing = false

      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Service worker registered successfully (silent)

          // Check for updates
          const handleUpdateFound = () => {
            const newWorker = registration.installing
            if (newWorker) {
              const handleStateChange = () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available - show update prompt
                  // Using a simple confirm for now (can be replaced with custom modal)
                  const shouldUpdate = window.confirm(
                    'A new version of Thrive is available! Would you like to update now?'
                  )
                  
                  if (shouldUpdate) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                }
              }
              
              newWorker.addEventListener('statechange', handleStateChange)
            }
          }

          registration.addEventListener('updatefound', handleUpdateFound)
        })
        .catch(() => {
          // Service worker registration failed (silent - graceful degradation)
          // App will continue to work without SW
        })

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      // Cleanup event listeners on unmount
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [])

  return null
}
