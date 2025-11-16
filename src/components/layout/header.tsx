'use client'

import { Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/finance': 'Finance',
  '/tasks': 'Tasks',
  '/health': 'Health & Wellness',
  '/routines': 'Daily Routines',
  '/settings': 'Settings',
  '/add': 'Quick Add',
  '/more': 'More',
}

export function Header() {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] || 'Thrive'

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800 safe-area-top">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">Thrive</span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="btn-icon relative" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
