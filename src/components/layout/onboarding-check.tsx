'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { db, initializeSettings } from '@/lib/db/schema'

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkOnboarding() {
      try {
        // Initialize settings if they don't exist
        await initializeSettings()
        
        // Check if onboarding is complete
        const settings = await db.settings.get('user_settings')
        
        // If not on onboarding page and onboarding not complete, redirect
        if (!pathname.includes('/onboarding') && settings && !settings.onboardingComplete) {
          router.push('/onboarding')
        } else if (pathname.includes('/onboarding') && settings?.onboardingComplete) {
          // If on onboarding page but already complete, redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [pathname, router])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-600 rounded-full opacity-75"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
