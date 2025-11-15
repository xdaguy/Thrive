'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { WeightTab } from '@/components/health/weight-tab'
import { ExerciseTab } from '@/components/health/exercise-tab'
import { MealsTab } from '@/components/health/meals-tab'

type Tab = 'weight' | 'exercise' | 'meals'

export default function HealthPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('weight')
  const [shouldOpenForm, setShouldOpenForm] = useState(false)

  useEffect(() => {
    // Handle URL parameters for tab and form opening
    const tab = searchParams.get('tab') as Tab
    const add = searchParams.get('add')
    
    if (tab && ['weight', 'exercise', 'meals'].includes(tab)) {
      setActiveTab(tab)
    }
    
    if (add === 'true') {
      setShouldOpenForm(true)
      // Reset after triggering
      setTimeout(() => setShouldOpenForm(false), 100)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Health & Wellness
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your weight, exercise, and meals
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'weight'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Weight
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'exercise'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Exercise
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'meals'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Meals
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'weight' && <WeightTab openForm={shouldOpenForm} />}
          {activeTab === 'exercise' && <ExerciseTab openForm={shouldOpenForm} />}
          {activeTab === 'meals' && <MealsTab openForm={shouldOpenForm} />}
        </div>
      </div>
    </div>
  )
}
