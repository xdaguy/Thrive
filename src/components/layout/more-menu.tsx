'use client'

import { X, CheckSquare, RotateCw, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { haptics } from '@/lib/haptics'

interface MoreMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      icon: CheckSquare,
      label: 'Tasks',
      description: 'Manage your tasks',
      href: '/tasks',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: RotateCw,
      label: 'Routines',
      description: 'Daily routines',
      href: '/routines',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences',
      href: '/settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    }
  ]

  const handleClose = () => {
    haptics.light()
    onClose()
  }

  const handleItemClick = () => {
    haptics.selection()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
        <div className="bg-white dark:bg-[#1A1A1A] rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1A1A1A]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">More</h2>
            <motion.button
              onClick={handleClose}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleItemClick}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all touch-manipulation ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="activeMenuIndicator"
                        className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Safe area spacing */}
          <div className="h-20" />
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
