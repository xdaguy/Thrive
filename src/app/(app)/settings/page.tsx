'use client'

import { useState, useEffect } from 'react'
import { Database, Cloud, Download, Upload, Trash2, Info, DollarSign, Weight as WeightIcon, Calendar, User, RefreshCw, LogOut, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { db } from '@/lib/db/schema'
import { useTheme } from 'next-themes'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations'
import { downloadBackup, importBackup, parseBackupFile } from '@/lib/sync'
import {
  authorizeWithGoogle,
  isAuthorized,
  signOut,
} from '@/lib/google/oauth-new'
import {
  startAutoSync,
  stopAutoSync,
  syncNow,
  isSyncing,
  getLastSyncTime,
} from '@/lib/google'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function SettingsPage() {
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    debts: 0,
    tasks: 0,
    weight: 0,
    exercise: 0,
    meals: 0,
    routines: 0
  })
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Google Drive sync state
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [processingOnboarding, setProcessingOnboarding] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'import' | 'disconnect' | 'clear' | 'clearFinal'
    data?: any
  }>({ isOpen: false, type: 'import' })

  useEffect(() => {
    setMounted(true)
    loadStats()
    loadPreferences()
    checkGoogleConnection()
    
    // Listen for sync events
    DataEvents.on(DATA_EVENTS.SYNC_COMPLETED, handleSyncCompleted)
    DataEvents.on(DATA_EVENTS.SYNC_ERROR, handleSyncError)
    
    return () => {
      DataEvents.off(DATA_EVENTS.SYNC_COMPLETED, handleSyncCompleted)
      DataEvents.off(DATA_EVENTS.SYNC_ERROR, handleSyncError)
    }
  }, [])

  // Handle OAuth callback from Google
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    const handleCallback = async () => {
      if (params.get('connected') === 'true') {
        // Check if this is from onboarding
        const onboardingPending = sessionStorage.getItem('onboarding_pending')
        const onboardingFormData = sessionStorage.getItem('onboarding_form_data')
        
        if (onboardingPending === 'true' && onboardingFormData) {
          // ONBOARDING FLOW: Download cloud backup FIRST, then create if needed
          console.log('🎓 Onboarding flow detected')
          setProcessingOnboarding(true)
          
          const formData = JSON.parse(onboardingFormData)
          
          // Set connected state first
          setGoogleConnected(true)
          
          // Load email
          const emailCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('google_user_email='))
          if (emailCookie) {
            const email = emailCookie.split('=')[1]
            setGoogleEmail(decodeURIComponent(email))
          }
          
          try {
            // Try to download cloud backup directly
            console.log('📥 Attempting to download cloud backup...')
            const { downloadBackup } = await import('@/lib/google/drive-new')
            const { importBackup } = await import('@/lib/sync/import-manager')
            
            const cloudBackup = await downloadBackup()
            
            if (cloudBackup) {
              // Cloud backup exists! Import it (this creates settings from cloud)
              console.log('✅ Cloud backup found, importing...')
              await importBackup(cloudBackup, {
                merge: false, // REPLACE mode, don't merge
                preserveUnknown: true,
                skipDuplicates: true,
                validateSchema: true
              })
              
              // Mark onboarding complete (or create if import didn't have settings)
              const settings = await db.settings.get('user_settings')
              if (settings) {
                // Cloud had settings, update them
                console.log('✅ Cloud settings exist, marking onboarding complete')
                await db.settings.put({
                  ...settings,
                  onboardingComplete: true,
                  syncEnabled: true,
                  syncProvider: 'google'
                  // Keep cloud updatedAt!
                })
              } else {
                // Cloud backup had no settings, create from form data
                console.log('⚠️ Cloud backup had no settings, creating from form')
                await db.settings.put({
                  id: 'user_settings',
                  name: formData.name || 'User',
                  currency: formData.currency || 'USD',
                  weightUnit: formData.weightUnit || 'kg',
                  dateFormat: formData.dateFormat || 'MM/DD/YYYY',
                  theme: 'system',
                  onboardingComplete: true,
                  syncEnabled: true,
                  syncProvider: 'google',
                  encryptionEnabled: false,
                  updatedAt: new Date()
                })
              }
              console.log('✅ Settings ready with onboarding complete')
            } else {
              // No cloud backup, create new settings from form
              console.log('📝 No cloud backup, creating new settings')
              await db.settings.put({
                id: 'user_settings',
                name: formData.name || 'User',
                currency: formData.currency || 'USD',
                weightUnit: formData.weightUnit || 'kg',
                dateFormat: formData.dateFormat || 'MM/DD/YYYY',
                theme: 'system',
                onboardingComplete: true,
                syncEnabled: true,
                syncProvider: 'google',
                encryptionEnabled: false,
                updatedAt: new Date()
              })
            }
            
            // Start auto-sync for future changes
            await startAutoSync(true)
            
          } catch (error) {
            console.error('Failed to download cloud backup:', error)
            // Fallback: create settings from form data
            await db.settings.put({
              id: 'user_settings',
              name: formData.name || 'User',
              currency: formData.currency || 'USD',
              weightUnit: formData.weightUnit || 'kg',
              dateFormat: formData.dateFormat || 'MM/DD/YYYY',
              theme: 'system',
              onboardingComplete: true,
              syncEnabled: true,
              syncProvider: 'google',
              encryptionEnabled: false,
              updatedAt: new Date()
            })
            console.log('⚠️ Created local settings (cloud download failed)')
            
            // Try to start sync anyway
            startAutoSync(true).catch(console.error)
          }
          
          // Clear onboarding flags
          sessionStorage.removeItem('onboarding_pending')
          sessionStorage.removeItem('onboarding_form_data')
          
          DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
          
          // Show success toast
          toast.success('Successfully connected to Google Drive!')
          
          // Wait to ensure toast is visible before redirect
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Redirect to dashboard (onboarding is complete)
          window.location.href = '/dashboard'
        } else {
          // REGULAR CONNECT FLOW: User connecting from settings
          console.log('⚙️ Regular connect flow')
          
          const settings = await db.settings.get('user_settings')
          if (settings) {
            await db.settings.put({
              ...settings,
              syncEnabled: true,
              syncProvider: 'google',
              lastSyncAt: new Date(),
              updatedAt: new Date()
            })
            DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
          }
          
          setGoogleConnected(true)
          
          const emailCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('google_user_email='))
          if (emailCookie) {
            const email = emailCookie.split('=')[1]
            setGoogleEmail(decodeURIComponent(email))
          }
          
          await startAutoSync(true)
          
          toast.success('Successfully connected to Google Drive!')
          window.history.replaceState({}, '', '/settings')
        }
      } else if (params.get('error')) {
        const error = params.get('error')
        toast.error(`Connection failed: ${error}`)
        window.history.replaceState({}, '', '/settings')
      }
    }
    
    handleCallback()
  }, [])

  async function loadStats() {
    const income = await db.income.count()
    const expenses = await db.expenses.count()
    const debts = await db.debts.count()
    const tasks = await db.tasks.count()
    const weight = await db.weight.count()
    const exercise = await db.exercise.count()
    const meals = await db.meals.count()
    const routines = await db.routines.count()

    setStats({ income, expenses, debts, tasks, weight, exercise, meals, routines })
  }

  async function loadPreferences() {
    const settings = await db.settings.get('user_settings')
    if (settings) {
      setName(settings.name || '')
      setCurrency(settings.currency)
      setWeightUnit(settings.weightUnit)
      setDateFormat(settings.dateFormat)
    }
  }

  async function savePreference(key: string, value: string | boolean) {
    await db.settings.update('user_settings', {
      [key]: value,
      updatedAt: new Date()
    })
    // Emit event so other components can update
    DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
  }

  async function handleExportData() {
    // Use toast.promise for better UX
    toast.promise(
      downloadBackup(),
      {
        loading: 'Creating backup...',
        success: 'Backup downloaded successfully!',
        error: 'Failed to export data'
      }
    )
  }

  async function handleImportData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      try {
        // Parse backup file
        const data = await parseBackupFile(file)

        // Show confirmation modal
        setConfirmDialog({
          isOpen: true,
          type: 'import',
          data,
        })
      } catch (error) {
        console.error('Import failed:', error)
        toast.error('Failed to import data. Please check the file format.')
      }
    }

    input.click()
  }

  async function executeImport(data: any) {
    try {
      const importPromise = importBackup(data, {
        merge: true,
        preserveUnknown: true,
        skipDuplicates: true,
        validateSchema: true
      })

      toast.promise(
        importPromise,
        {
          loading: 'Importing data...',
          success: (result) => {
            loadStats()
            loadPreferences()
            if (result.warnings.length > 0) {
              return `${result.message} (${result.warnings.length} warnings)`
            }
            return result.message
          },
          error: (result) => {
            if (result?.message) {
              return `${result.message}${result.warnings?.length ? ` (${result.warnings.length} issues)` : ''}`
            }
            return 'Failed to import data. Please check the file format.'
          }
        }
      )
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Failed to import data. Please check the file format.')
    }
  }

  // Google Drive sync functions
  async function checkGoogleConnection() {
    const connected = await isAuthorized()
    setGoogleConnected(connected)
    
    if (connected) {
      // Load Google user email from cookie
      const emailCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('google_user_email='))
      
      if (emailCookie) {
        const email = emailCookie.split('=')[1]
        setGoogleEmail(decodeURIComponent(email))
      }
      
      // Load last sync time
      const lastSyncTime = getLastSyncTime()
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime))
      }
      
      // Start auto-sync if connected
      await startAutoSync()
    } else {
      setGoogleEmail('')
    }
    
    setSyncing(isSyncing())
  }

  async function handleConnectGoogleDrive() {
    try {
      // This will redirect to Google OAuth
      await authorizeWithGoogle()
    } catch (error) {
      console.error('Google Drive connection failed:', error)
      toast.error('Failed to connect to Google Drive.')
    }
  }

  async function handleDisconnectGoogleDrive() {
    setConfirmDialog({
      isOpen: true,
      type: 'disconnect',
    })
  }

  async function executeDisconnect() {
    try {
      // Update database settings
      const settings = await db.settings.get('user_settings')
      if (settings) {
        await db.settings.put({
          ...settings,
          syncEnabled: false,
          syncProvider: undefined,
          lastSyncAt: undefined,
          updatedAt: new Date()
        })
        DataEvents.emit(DATA_EVENTS.SETTINGS_CHANGED)
        
        // Small delay to ensure database write completes
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Stop auto-sync
      stopAutoSync()
      
      // Show success toast BEFORE reload
      toast.success('Disconnected from Google Drive')
      
      // Wait longer to ensure toast is visible
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Clear auth cookies and reload page
      try {
        await signOut()
      } catch (signOutError) {
        console.error('Sign out failed, manually reloading:', signOutError)
        // Fallback: clear state and reload
        setGoogleConnected(false)
        setGoogleEmail('')
        setLastSync(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Disconnect failed:', error)
      toast.error('Failed to disconnect. Please try again.')
    }
  }

  async function handleSyncNow() {
    if (syncing) {
      toast.info('Sync already in progress...')
      return
    }

    setSyncing(true)
    
    // Use toast.promise for better UX
    toast.promise(
      syncNow(),
      {
        loading: 'Syncing with Google Drive...',
        success: () => {
          const lastSyncTime = getLastSyncTime()
          if (lastSyncTime) {
            setLastSync(new Date(lastSyncTime))
          }
          setSyncing(false)
          return 'Sync completed successfully!'
        },
        error: (error) => {
          setSyncing(false)
          return `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    )
  }

  function handleSyncCompleted() {
    const lastSyncTime = getLastSyncTime()
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime))
    }
    setSyncing(false)
  }

  function handleSyncError() {
    setSyncing(false)
  }

  async function handleClearAllData() {
    setConfirmDialog({
      isOpen: true,
      type: 'clear',
    })
  }

  async function handleFirstClearConfirm() {
    // Close first modal, then open second after animation completes
    setConfirmDialog({ isOpen: false, type: 'clear' })
    setTimeout(() => {
      setConfirmDialog({
        isOpen: true,
        type: 'clearFinal',
        data: undefined
      })
    }, 250)
  }

  async function executeClearData() {
    try {
      await db.income.clear()
      await db.expenses.clear()
      await db.debts.clear()
      await db.tasks.clear()
      await db.reminders.clear()
      await db.weight.clear()
      await db.exercise.clear()
      await db.meals.clear()
      await db.routines.clear()
      await db.routineCompletions.clear()

      toast.success('All data cleared successfully')
      loadStats()
    } catch (error) {
      console.error('Clear failed:', error)
      toast.error('Failed to clear data')
    }
  }

  async function handleCurrencyChange(newCurrency: string) {
    setCurrency(newCurrency)
    await savePreference('currency', newCurrency)
  }

  async function handleWeightUnitChange(newUnit: 'kg' | 'lbs') {
    setWeightUnit(newUnit)
    await savePreference('weightUnit', newUnit)
  }

  async function handleNameChange(newName: string) {
    setName(newName)
    await savePreference('name', newName)
  }

  async function handleDateFormatChange(newFormat: string) {
    setDateFormat(newFormat)
    await savePreference('dateFormat', newFormat)
  }

  const totalEntries = Object.values(stats).reduce((sum, count) => sum + count, 0)

  // Show loading screen while processing onboarding OAuth callback
  if (processingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connecting to Google Drive
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Downloading your settings and data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div {...fadeIn}>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and data
        </p>
      </motion.div>

      {/* Preferences */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="input"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <WeightIcon className="w-4 h-4" />
              Weight Unit
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleWeightUnitChange('kg')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  weightUnit === 'kg'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                onClick={() => handleWeightUnitChange('lbs')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  weightUnit === 'lbs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              className="input"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred theme or use system settings
        </p>
        {mounted && (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">☀️</div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Light</p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">🌙</div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Dark</p>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 border-2 rounded-xl text-center transition-all ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">System</p>
            </button>
          </div>
        )}
      </motion.div>

      {/* Your Data */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Your Data
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.income}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Income</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expenses}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Expenses</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.debts}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Debts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasks}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tasks</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.weight}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Weight Logs</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.exercise}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Exercises</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.meals}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Meals</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.routines}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Routines</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Total: {totalEntries} entries</strong> stored locally in your browser
          </p>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download all your data as JSON</p>
              </div>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Download</span>
          </button>

          <button
            onClick={handleImportData}
            className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Import Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Restore data from backup file</p>
              </div>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Upload</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Clear All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delete all entries (cannot be undone)</p>
              </div>
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Delete</span>
          </button>
        </div>
      </motion.div>

      {/* Cloud Sync */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.35 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Google Drive Sync
        </h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>✅ Auto-Sync Enabled:</strong> Your data automatically syncs to YOUR Google Drive.
            We never store your data on our servers.
          </p>
        </div>

        {googleConnected ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-300">
                  Connected to Google Drive
                </span>
              </div>
              {googleEmail && (
                <div className="text-xs text-gray-600 dark:text-gray-400 pl-7">
                  {googleEmail}
                </div>
              )}
            </div>

            {/* Last Sync Info */}
            {lastSync && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Last synced:</strong>{' '}
                {lastSync.toLocaleString()}
              </div>
            )}

            {/* Sync Status */}
            {syncing && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
              
              <button
                onClick={handleDisconnectGoogleDrive}
                className="btn-secondary flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            {/* Info Note */}
            <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              💡 <strong>Auto-sync is ON:</strong> Your data automatically syncs 2 seconds after any change.
              Close protection: If you close the app with unsaved changes, you'll be prompted to save first.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleConnectGoogleDrive}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Cloud className="w-5 h-5" />
              Connect Google Drive
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <strong>Why connect?</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Auto-sync your data across devices</li>
                <li>Cloud backup for data safety</li>
                <li>Access your data anywhere</li>
                <li>Fully secure - data saved to YOUR Drive</li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>

      {/* About Thrive */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About Thrive
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Storage:</strong> IndexedDB (Local) {googleConnected && '+ Google Drive (Cloud)'}</p>
          <p><strong>Data Location:</strong> Your browser {googleConnected && '+ Your Google Drive'}</p>
          <p className="pt-2">
            Thrive is an open-source personal management app that keeps your data local and private.
          </p>
        </div>
      </motion.div>

      {/* Resources */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.45 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resources
        </h3>
        <div className="space-y-2 text-sm">
          <a href="https://github.com/xdaguy/thrive#readme" target="_blank" rel="noopener noreferrer" 
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            📖 Documentation
          </a>
          <a href="https://github.com/xdaguy/thrive" target="_blank" rel="noopener noreferrer"
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            💻 GitHub Repository
          </a>
          <a href="https://github.com/xdaguy/thrive/issues/new" target="_blank" rel="noopener noreferrer"
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            🐛 Report a Bug
          </a>
        </div>
      </motion.div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'import'}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          executeImport(confirmDialog.data)
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }}
        title="Import Data"
        message="This will merge the imported data with your existing data. Newer versions will be kept, duplicates will be skipped."
        details={confirmDialog.data ? [
          `${confirmDialog.data.income?.length || 0} income entries`,
          `${confirmDialog.data.expenses?.length || 0} expense entries`,
          `${confirmDialog.data.debts?.length || 0} debt entries`,
          `${confirmDialog.data.tasks?.length || 0} tasks`,
          `${confirmDialog.data.weight?.length || 0} weight entries`,
          `${confirmDialog.data.exercise?.length || 0} exercise entries`,
          `${confirmDialog.data.meals?.length || 0} meal entries`,
          `${confirmDialog.data.routines?.length || 0} routines`,
        ] : []}
        variant="info"
        confirmText="Import Data"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'disconnect'}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          executeDisconnect()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }}
        title="Disconnect Google Drive"
        message="This will stop auto-sync and remove the connection to Google Drive. Your local data will be kept. You can reconnect anytime."
        details={[
          'Stop auto-sync',
          'Remove connection',
          'Keep local data',
        ]}
        variant="warning"
        confirmText="Disconnect"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'clear'}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleFirstClearConfirm}
        title="Delete All Data"
        message="This will permanently delete ALL your data. This action cannot be undone."
        details={[
          `${stats.income} income entries`,
          `${stats.expenses} expense entries`,
          `${stats.debts} debt entries`,
          `${stats.tasks} tasks`,
          `${stats.weight} weight entries`,
          `${stats.exercise} exercise entries`,
          `${stats.meals} meal entries`,
          `${stats.routines} routines`,
        ]}
        variant="danger"
        confirmText="Continue"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'clearFinal'}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          executeClearData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }}
        title="⚠️ Final Warning"
        message="This is your last chance! All data will be permanently deleted and CANNOT be recovered."
        variant="danger"
        confirmText="Delete Everything"
        cancelText="Cancel"
      />
    </motion.div>
  )
}
