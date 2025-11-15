'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { OnboardingCheck } from '@/components/layout/onboarding-check'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isOnboarding = pathname.includes('/onboarding')

  return (
    <OnboardingCheck>
      {isOnboarding ? (
        // Onboarding page without sidebar/header
        <>{children}</>
      ) : (
        // Regular app layout with sidebar/header
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0A0A0A] pb-20 md:pb-0">
              <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      )}
    </OnboardingCheck>
  )
}
