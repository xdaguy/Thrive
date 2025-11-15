'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db/schema'

export default function StartPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        // Check onboarding status
        const settings = await db.settings.get('user_settings')
        
        if (settings?.onboardingComplete) {
          // Already onboarded → Go to dashboard
          router.replace('/dashboard')
        } else {
          // Not onboarded → Go to onboarding
          router.replace('/onboarding')
        }
      } catch (error) {
        console.error('Failed to check status:', error)
        // On error, default to onboarding (safer)
        router.replace('/onboarding')
      }
    }

    checkAndRedirect()
  }, [router])

  // Show minimal loading state while checking
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
