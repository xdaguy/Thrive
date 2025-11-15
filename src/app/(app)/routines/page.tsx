'use client'

import { RotateCw, Trophy, Target } from 'lucide-react'

export default function RoutinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Daily Routines
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Build lasting habits with daily routines
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Routines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0 days</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="card text-center py-16">
        <div className="text-6xl mb-6">🔄</div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          Routines System Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          Create custom daily routines, track your consistency, and build lasting habits with streak tracking
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 max-w-lg mx-auto">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Planned Features:</h4>
          <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Create morning, afternoon, evening, and night routines
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Add multiple items to each routine
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Daily checklist to track completion
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Streak counter for consistency
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Calendar heatmap visualization
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Completion percentage tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
