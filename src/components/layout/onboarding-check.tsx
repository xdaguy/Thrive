'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { db, initializeSettings } from '@/lib/db/schema'

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const hasChecked = useRef(false)

  useEffect(() => {
    // Only check ONCE on initial mount, not on every route change
    if (hasChecked.current) {
      return
    }

    async function checkOnboarding() {
      try {
        // Check if we're processing OAuth callback from onboarding
        const onboardingPending = sessionStorage.getItem('onboarding_pending')
        
        if (onboardingPending === 'true') {
          // Skip onboarding check - we're in the middle of OAuth flow
          console.log('⏳ Onboarding OAuth in progress, skipping check')
          setIsChecking(false)
          hasChecked.current = true
          return
        }
        
        // Initialize settings if they don't exist
        await initializeSettings()
        
        // Check if onboarding is complete
        const settings = await db.settings.get('user_settings')
        const isComplete = settings?.onboardingComplete || false
        
        setOnboardingComplete(isComplete)
        hasChecked.current = true
        
        // If not on onboarding page and onboarding not complete, redirect
        if (!pathname.includes('/onboarding') && !isComplete) {
          router.push('/onboarding')
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        hasChecked.current = true
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [pathname, router])

  // Only show loading on FIRST check, not on route changes
  if (isChecking && !hasChecked.current) {
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
