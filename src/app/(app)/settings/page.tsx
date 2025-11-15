'use client'

import { useState, useEffect } from 'react'
import { Database, Cloud, Download, Upload, Trash2, Info, DollarSign, Weight as WeightIcon, Calendar } from 'lucide-react'
import { db } from '@/lib/db/schema'
import { useTheme } from 'next-themes'

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
  const [currency, setCurrency] = useState('USD')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    loadStats()
    loadPreferences()
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
      setCurrency(settings.currency)
      setWeightUnit(settings.weightUnit)
    }
  }

  async function savePreference(key: string, value: any) {
    await db.settings.update('user_settings', {
      [key]: value,
      updatedAt: new Date()
    })
  }

  async function handleExportData() {
    try {
      const allData = {
        income: await db.income.toArray(),
        expenses: await db.expenses.toArray(),
        debts: await db.debts.toArray(),
        tasks: await db.tasks.toArray(),
        weight: await db.weight.toArray(),
        exercise: await db.exercise.toArray(),
        meals: await db.meals.toArray(),
        routines: await db.routines.toArray(),
        routineCompletions: await db.routineCompletions.toArray(),
        settings: await db.settings.toArray(),
        exportDate: new Date().toISOString(),
        version: '0.1.0'
      }

      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `thrive-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('✅ Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('❌ Failed to export data')
    }
  }

  async function handleImportData() {
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
        if (!data.income || !data.expenses || !data.tasks) {
          alert('❌ Invalid backup file format')
          return
        }

        const confirmed = confirm(
          '⚠️ Import Data\n\n' +
          'This will ADD the following to your existing data:\n\n' +
          `• ${data.income?.length || 0} income entries\n` +
          `• ${data.expenses?.length || 0} expense entries\n` +
          `• ${data.debts?.length || 0} debt entries\n` +
          `• ${data.tasks?.length || 0} tasks\n` +
          `• ${data.weight?.length || 0} weight entries\n` +
          `• ${data.exercise?.length || 0} exercise entries\n` +
          `• ${data.meals?.length || 0} meal entries\n` +
          `• ${data.routines?.length || 0} routines\n\n` +
          'This will NOT delete existing data.\n\n' +
          'Continue with import?'
        )

        if (!confirmed) return

        // Import data
        let importedCount = 0

        if (data.income?.length) {
          await db.income.bulkAdd(data.income)
          importedCount += data.income.length
        }
        if (data.expenses?.length) {
          await db.expenses.bulkAdd(data.expenses)
          importedCount += data.expenses.length
        }
        if (data.debts?.length) {
          await db.debts.bulkAdd(data.debts)
          importedCount += data.debts.length
        }
        if (data.tasks?.length) {
          await db.tasks.bulkAdd(data.tasks)
          importedCount += data.tasks.length
        }
        if (data.weight?.length) {
          await db.weight.bulkAdd(data.weight)
          importedCount += data.weight.length
        }
        if (data.exercise?.length) {
          await db.exercise.bulkAdd(data.exercise)
          importedCount += data.exercise.length
        }
        if (data.meals?.length) {
          await db.meals.bulkAdd(data.meals)
          importedCount += data.meals.length
        }
        if (data.routines?.length) {
          await db.routines.bulkAdd(data.routines)
          importedCount += data.routines.length
        }
        if (data.routineCompletions?.length) {
          await db.routineCompletions.bulkAdd(data.routineCompletions)
          importedCount += data.routineCompletions.length
        }

        alert(`✅ Successfully imported ${importedCount} entries!`)
        loadStats()
        loadPreferences()
      } catch (error) {
        console.error('Import failed:', error)
        alert('❌ Failed to import data. Please check the file format.')
      }
    }

    input.click()
  }

  async function handleClearAllData() {
    const confirmed = confirm(
      '⚠️ WARNING: This will delete ALL your data permanently!\n\n' +
      'This includes:\n' +
      `• ${stats.income} income entries\n` +
      `• ${stats.expenses} expense entries\n` +
      `• ${stats.debts} debt entries\n` +
      `• ${stats.tasks} tasks\n` +
      `• ${stats.weight} weight entries\n` +
      `• ${stats.exercise} exercise entries\n` +
      `• ${stats.meals} meal entries\n` +
      `• ${stats.routines} routines\n\n` +
      'Are you absolutely sure?'
    )

    if (!confirmed) return

    const doubleConfirm = confirm('⚠️ Last chance! This CANNOT be undone. Proceed?')
    
    if (!doubleConfirm) return

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

      alert('✅ All data cleared successfully')
      loadStats()
    } catch (error) {
      console.error('Clear failed:', error)
      alert('❌ Failed to clear data')
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

  const totalEntries = Object.values(stats).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and data
        </p>
      </div>

      {/* Data Statistics */}
      <div className="card">
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
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h3>
        <div className="space-y-4">
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
        </div>
      </div>

      {/* About Thrive */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About Thrive
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Version:</strong> 0.1.0 (MVP)</p>
          <p><strong>Storage:</strong> Local (IndexedDB)</p>
          <p><strong>Data Location:</strong> Your browser</p>
          <p className="pt-2">
            Thrive is an open-source personal management app that keeps your data local and private.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
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
      </div>

      {/* Cloud Sync */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Cloud Sync
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>Privacy First:</strong> When enabled, your data will be encrypted and synced to YOUR Google Drive.
            We never store your data on our servers.
          </p>
        </div>
        <button className="w-full btn-primary">
          Connect Google Drive (Coming Soon)
        </button>
      </div>

      {/* Theme */}
      <div className="card">
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
      </div>

      {/* Links */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resources
        </h3>
        <div className="space-y-2 text-sm">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            📖 Documentation
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            💻 GitHub Repository
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            🐛 Report a Bug
          </a>
        </div>
      </div>
    </div>
  )
}
