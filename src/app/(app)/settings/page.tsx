'use client'

import { Database, Cloud, Download, Trash2, Info } from 'lucide-react'

export default function SettingsPage() {
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
          <button className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download all your data as JSON</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Coming Soon</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Clear All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delete all entries (cannot be undone)</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Coming Soon</span>
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Use the theme toggle in the header to switch between light and dark mode
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center">
            <div className="text-2xl mb-2">☀️</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Light</p>
          </div>
          <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center">
            <div className="text-2xl mb-2">🌙</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Dark</p>
          </div>
          <div className="p-4 border-2 border-blue-500 rounded-xl text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">System</p>
          </div>
        </div>
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
