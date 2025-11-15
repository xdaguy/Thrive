'use client'

import { useEffect, useState } from 'react'
import { initializeSettings } from '@/lib/db/schema'

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initDB = async () => {
      try {
        await initializeSettings()
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize database:', error)
        setIsReady(true) // Continue anyway
      }
    }

    initDB()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading Thrive...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
