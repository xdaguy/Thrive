'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, DollarSign, Scale, Calendar, ArrowRight, Sparkles, Database, Cloud, HardDrive, UserPlus, Upload, FileUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db/schema'
import { fadeIn, slideRight, slideLeft, scaleIn } from '@/lib/animations'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)', region: 'US' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)', region: 'UK/EU' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)', region: 'ISO' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState<'new' | 'existing' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
    weightUnit: 'kg' as 'kg' | 'lbs',
    dateFormat: 'MM/DD/YYYY',
    storagePreference: 'local' as 'local' | 'google' | 'dropbox' | 'onedrive'
  })

  async function handleSubmit(e?: any) {
    if (e?.preventDefault) {
      e.preventDefault()
    }

    // Only submit on step 5
    if (step !== 5) {
      return
    }

    // Validation
    if (!formData.name.trim()) {
      alert('Please enter your name')
      return
    }

    try {
      // Update settings with user preferences
      await db.settings.update('user_settings', {
        name: formData.name.trim(),
        currency: formData.currency,
        weightUnit: formData.weightUnit,
        dateFormat: formData.dateFormat,
        onboardingComplete: true,
        updatedAt: new Date()
        // Note: storagePreference is saved for future use (cloud sync coming soon)
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  async function handleRestoreFromBackup() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        // Validate data structure
        if (!data.version || !data.exportDate) {
          alert('❌ Invalid backup file format')
          return
        }

        const confirmed = confirm(
          '✅ Restore from Backup\n\n' +
          `This will restore ALL your data including:\n\n` +
          `• Settings and preferences\n` +
          `• ${data.income?.length || 0} income entries\n` +
          `• ${data.expenses?.length || 0} expense entries\n` +
          `• ${data.debts?.length || 0} debts\n` +
          `• ${data.tasks?.length || 0} tasks\n` +
          `• ${data.weight?.length || 0} weight entries\n` +
          `• ${data.exercise?.length || 0} exercises\n` +
          `• ${data.meals?.length || 0} meals\n` +
          `• ${data.routines?.length || 0} routines\n\n` +
          `Backup Date: ${new Date(data.exportDate).toLocaleDateString()}\n\n` +
          'Continue with restore?'
        )

        if (!confirmed) return

        // Clear existing data first
        await db.income.clear()
        await db.expenses.clear()
        await db.debts.clear()
        await db.tasks.clear()
        await db.weight.clear()
        await db.exercise.clear()
        await db.meals.clear()
        await db.routines.clear()
        await db.routineCompletions.clear()

        // Restore data
        if (data.income?.length) await db.income.bulkAdd(data.income)
        if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses)
        if (data.debts?.length) await db.debts.bulkAdd(data.debts)
        if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks)
        if (data.weight?.length) await db.weight.bulkAdd(data.weight)
        if (data.exercise?.length) await db.exercise.bulkAdd(data.exercise)
        if (data.meals?.length) await db.meals.bulkAdd(data.meals)
        if (data.routines?.length) await db.routines.bulkAdd(data.routines)
        if (data.routineCompletions?.length) await db.routineCompletions.bulkAdd(data.routineCompletions)

        // Restore settings (most important for existing users!)
        if (data.settings?.length) {
          const userSettings = data.settings.find((s: any) => s.id === 'user_settings')
          if (userSettings) {
            await db.settings.put({
              ...userSettings,
              onboardingComplete: true, // Mark onboarding as complete
              updatedAt: new Date()
            })
          }
        }

        alert('✅ Backup restored successfully! Welcome back!')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Failed to restore backup:', error)
        alert('❌ Failed to restore backup. Please check the file and try again.')
      }
    }

    input.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div 
          {...fadeIn}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div 
            {...scaleIn}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-3 sm:mb-4"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to Thrive
            </h1>
          </motion.div>
          <motion.p 
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-4"
          >
            Let's personalize your experience
          </motion.p>
        </motion.div>

        {/* Progress Steps - Only show for new users after Step 0 */}
        <AnimatePresence mode="wait">
          {step > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-4"
            >
              {[1, 2, 3, 4, 5].map((s, index) => (
                <motion.div
                  key={s}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    s <= step
                      ? 'bg-blue-600 dark:bg-blue-400 w-10 sm:w-12 md:w-16'
                      : 'bg-gray-300 dark:bg-gray-700 w-6 sm:w-8'
                  }`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <div className="card space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 0: New or Existing User */}
            {step === 0 && (
              <motion.div 
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 px-4">
                  Welcome to Thrive!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                  Let's get you started
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* New User */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType('new')
                    setStep(1)
                  }}
                  className="p-5 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98] transition-all text-left group touch-manipulation"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                      I'm New Here
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Set up your account and start fresh
                    </p>
                  </div>
                </button>

                {/* Existing User */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType('existing')
                  }}
                  className="p-5 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-[0.98] transition-all text-left group touch-manipulation"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <FileUp className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                      I Have Data
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Restore from backup or sync with cloud
                    </p>
                  </div>
                </button>
              </div>

              {/* Existing User Options */}
              {userType === 'existing' && (
                <div className="mt-5 sm:mt-6 animate-in fade-in duration-300">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center px-4">
                    Restore Your Data
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Upload Backup */}
                    <button
                      type="button"
                      onClick={handleRestoreFromBackup}
                      className="w-full p-3.5 sm:p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.98] transition-all touch-manipulation"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                            Upload Backup File
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Restore from a .json backup file
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Cloud Options (Coming Soon) */}
                    <button
                      type="button"
                      disabled
                      className="w-full p-3.5 sm:p-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                            <div className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                              Sync from Cloud
                            </div>
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              Coming Soon
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                            Google Drive, Dropbox, OneDrive
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Back to Selection */}
                    <button
                      type="button"
                      onClick={() => setUserType(null)}
                      className="w-full text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors py-2 touch-manipulation"
                    >
                      ← Back to selection
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-5 sm:mb-6 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  What's your name?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  We'll use this to personalize your experience
                </p>
              </div>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-center text-xl sm:text-2xl font-semibold py-3 sm:py-4"
                placeholder="Enter your name"
                autoFocus
                required
              />
            </motion.div>
          )}

          {/* Step 2: Currency */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-5 sm:mb-6 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Choose your currency
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  This will be used for all financial data
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: currency.code })}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-[0.97] touch-manipulation ${
                      formData.currency === currency.code
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{currency.symbol}</div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">
                      {currency.name}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Weight Unit */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-5 sm:mb-6 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Weight unit preference
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  How do you prefer to track your weight?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'kg' })}
                  className={`p-5 sm:p-6 rounded-xl border-2 transition-all active:scale-[0.97] touch-manipulation ${
                    formData.weightUnit === 'kg'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                    kg
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Kilograms (Metric)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'lbs' })}
                  className={`p-5 sm:p-6 rounded-xl border-2 transition-all active:scale-[0.97] touch-manipulation ${
                    formData.weightUnit === 'lbs'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                    lbs
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Pounds (Imperial)
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Date Format */}
          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-5 sm:mb-6 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Date format preference
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Choose how dates should be displayed
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {DATE_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, dateFormat: format.value })}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] touch-manipulation ${
                      formData.dateFormat === format.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {format.label}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Common in {format.region}
                        </div>
                      </div>
                      {formData.dateFormat === format.value && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Data Storage */}
          {step === 5 && (
            <motion.div 
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-5 sm:mb-6 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Database className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Where to save your data?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Choose how you want to store your information
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* Local Storage (Available) */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, storagePreference: 'local' })}
                  className={`w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] touch-manipulation ${
                    formData.storagePreference === 'local'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          Local Storage
                        </div>
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">
                          Available
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Data saved in your browser. Private and secure.
                      </div>
                    </div>
                    {formData.storagePreference === 'local' && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Google Drive (Coming Soon) */}
                <div className="relative">
                  <button
                    type="button"
                    disabled
                    className="w-full p-3.5 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            Google Drive
                          </div>
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Sync across devices with Google Drive
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Dropbox (Coming Soon) */}
                <div className="relative">
                  <button
                    type="button"
                    disabled
                    className="w-full p-3.5 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            Dropbox
                          </div>
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Sync across devices with Dropbox
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* OneDrive (Coming Soon) */}
                <div className="relative">
                  <button
                    type="button"
                    disabled
                    className="w-full p-3.5 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                          <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            OneDrive
                          </div>
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Sync across devices with OneDrive
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    💡 <strong>Local Storage</strong> keeps your data private and secure in your browser. 
                    Cloud sync features will be added in future updates!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Navigation Buttons - Only show when step > 0 */}
          {step > 0 && (
            <div className="flex gap-2.5 sm:gap-3 pt-4 sm:pt-5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-3 touch-manipulation"
                >
                  Back
                </button>
              )}
              
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !formData.name.trim()) {
                      alert('Please enter your name')
                      return
                    }
                    setStep(step + 1)
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2.5 sm:py-3 touch-manipulation"
                >
                  Next
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await handleSubmit()
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2.5 sm:py-3 touch-manipulation"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Get Started
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Preview (Step 5) */}
        {step === 5 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-2 sm:mb-3">
              Your preferences:
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="px-2.5 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                👤 {formData.name}
              </span>
              <span className="px-2.5 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                💰 {formData.currency}
              </span>
              <span className="px-2.5 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                ⚖️ {formData.weightUnit}
              </span>
              <span className="px-2.5 sm:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                📅 {formData.dateFormat}
              </span>
              <span className="px-2.5 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                💾 {formData.storagePreference === 'local' ? 'Local Storage' : formData.storagePreference}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
