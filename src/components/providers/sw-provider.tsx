'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'

export function ServiceWorkerProvider() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [newWorker, setNewWorker] = useState<ServiceWorker | null>(null)

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
            const installingWorker = registration.installing
            if (installingWorker) {
              const handleStateChange = () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available - show update banner
                  setNewWorker(installingWorker)
                  setShowUpdatePrompt(true)
                }
              }
              
              installingWorker.addEventListener('statechange', handleStateChange)
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

  const handleUpdate = () => {
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdatePrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[999] pointer-events-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Update Available
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                A new version of Thrive is ready!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Update
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Dismiss update notification"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
