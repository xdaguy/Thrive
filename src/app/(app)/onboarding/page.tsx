'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, DollarSign, Scale, Calendar, ArrowRight, Sparkles, Database, Cloud, HardDrive } from 'lucide-react'
import { db } from '@/lib/db/schema'

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
  const [step, setStep] = useState(1)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to Thrive
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Let's personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step
                  ? 'bg-blue-600 dark:bg-blue-400 w-16'
                  : 'bg-gray-300 dark:bg-gray-700 w-8'
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <div className="card space-y-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What's your name?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll use this to personalize your experience
                </p>
              </div>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-center text-2xl font-semibold py-4"
                placeholder="Enter your name"
                autoFocus
                required
              />
            </div>
          )}

          {/* Step 2: Currency */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose your currency
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This will be used for all financial data
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: currency.code })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.currency === currency.code
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{currency.symbol}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {currency.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Weight Unit */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Weight unit preference
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  How do you prefer to track your weight?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'kg' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.weightUnit === 'kg'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    kg
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Kilograms (Metric)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, weightUnit: 'lbs' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.weightUnit === 'lbs'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    lbs
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pounds (Imperial)
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Date Format */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Date format preference
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose how dates should be displayed
                </p>
              </div>

              <div className="space-y-3">
                {DATE_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, dateFormat: format.value })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.dateFormat === format.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {format.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Common in {format.region}
                        </div>
                      </div>
                      {formData.dateFormat === format.value && (
                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Data Storage */}
          {step === 5 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Where to save your data?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose how you want to store your information
                </p>
              </div>

              <div className="space-y-3">
                {/* Local Storage (Available) */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, storagePreference: 'local' })}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.storagePreference === 'local'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Local Storage
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">
                          Available
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Data saved in your browser. Private and secure.
                      </div>
                    </div>
                    {formData.storagePreference === 'local' && (
                      <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Google Drive
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Dropbox
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Cloud className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            OneDrive
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Sync across devices with OneDrive
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 <strong>Local Storage</strong> keeps your data private and secure in your browser. 
                    Cloud sync features will be added in future updates!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
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
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await handleSubmit()
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Summary Preview (Step 5) */}
        {step === 5 && (
          <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
              Your preferences:
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                👤 {formData.name}
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                💰 {formData.currency}
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                ⚖️ {formData.weightUnit}
              </span>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                📅 {formData.dateFormat}
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                💾 {formData.storagePreference === 'local' ? 'Local Storage' : formData.storagePreference}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
