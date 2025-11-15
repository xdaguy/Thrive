'use client'

import { useState } from 'react'
import { Home, Wallet, Plus, Heart, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { QuickAddSheet } from './quick-add-sheet'
import { MoreMenu } from './more-menu'

export function MobileNav() {
  const pathname = usePathname()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Wallet, label: 'Finance', href: '/finance' },
    { icon: Plus, label: 'Add', action: 'quickAdd', special: true },
    { icon: Heart, label: 'Health', href: '/health' },
    { icon: Menu, label: 'More', action: 'more' },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.action === 'quickAdd') {
      setShowQuickAdd(true)
    } else if (item.action === 'more') {
      setShowMore(true)
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-800 safe-area-bottom md:hidden z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            if (item.special) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center relative -mt-8 touch-manipulation"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </button>
              )
            }

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 touch-manipulation"
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            }

            if (!item.href) return null

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Modals */}
      <QuickAddSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <MoreMenu isOpen={showMore} onClose={() => setShowMore(false)} />
    </>
  )
}
