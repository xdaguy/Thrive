'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)
      // Hide "back online" message after 3 seconds
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
        >
          <div
            className={`px-4 py-2 rounded-lg shadow-lg border flex items-center gap-2 ${
              isOnline
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Back online
                </p>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Offline mode - All data saved locally
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
