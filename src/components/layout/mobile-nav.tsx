'use client'

import { useState } from 'react'
import { Home, Wallet, Plus, Heart, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QuickAddSheet } from './quick-add-sheet'
import { MoreMenu } from './more-menu'
import { haptics } from '@/lib/haptics'

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
    haptics.selection()
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
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9, rotate: 45 }}
                  className="flex flex-col items-center justify-center relative -mt-8 touch-manipulation"
                >
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
                    animate={{ 
                      boxShadow: ['0 10px 25px -5px rgba(59, 130, 246, 0.5)', '0 10px 35px -5px rgba(59, 130, 246, 0.7)', '0 10px 25px -5px rgba(59, 130, 246, 0.5)'],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.button>
              )
            }

            if (item.action) {
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 touch-manipulation"
                >
                  <motion.div whileTap={{ scale: 1.2 }}>
                    <Icon className="w-6 h-6 mb-1" />
                  </motion.div>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              )
            }

            if (!item.href) return null

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => haptics.selection()}
                className="flex flex-col items-center justify-center flex-1 h-full touch-manipulation"
              >
                <motion.div 
                  className="flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    y: isActive ? [0, -3, 0] : 0
                  }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeInOut',
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  <Icon className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'
                  }`}>{item.label}</span>
                </motion.div>
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
