'use client'

import { useState, useEffect } from 'react'
import { Plus, RotateCw, Trophy, Target, Trash2, CheckCircle, Circle, X } from 'lucide-react'
import { 
  addRoutine, 
  getAllRoutines, 
  deleteRoutine, 
  getTodayRoutineCompletion,
  addRoutineCompletion,
  getRoutineStreak 
} from '@/lib/db/queries'
import { generateId, db } from '@/lib/db/schema'
import type { Routine, RoutineItem, RoutineCompletion } from '@/lib/db/schema'

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [completions, setCompletions] = useState<Record<string, RoutineCompletion>>({})
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    items: [{ id: generateId(), name: '', order: 0 }]
  })

  useEffect(() => {
    loadRoutines()
  }, [])

  async function loadRoutines() {
    const data = await getAllRoutines()
    setRoutines(data)
    
    // Load today's completions and streaks for each routine
    const completionsMap: Record<string, RoutineCompletion> = {}
    const streaksMap: Record<string, number> = {}
    
    for (const routine of data) {
      if (routine.id) {
        const completion = await getTodayRoutineCompletion(routine.id)
        if (completion) {
          completionsMap[routine.id] = completion
        }
        const streak = await getRoutineStreak(routine.id)
        streaksMap[routine.id] = streak
      }
    }
    
    setCompletions(completionsMap)
    setStreaks(streaksMap)
  }

  function addNewItem() {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: generateId(), name: '', order: formData.items.length }
      ]
    })
  }

  function removeItem(index: number) {
    if (formData.items.length === 1) return
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  function updateItem(index: number, name: string) {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], name }
    setFormData({ ...formData, items: newItems })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await addRoutine({
      name: formData.name,
      timeOfDay: formData.timeOfDay,
      items: formData.items.filter(item => item.name.trim() !== '')
    })

    setFormData({
      name: '',
      timeOfDay: 'morning',
      items: [{ id: generateId(), name: '', order: 0 }]
    })
    setShowForm(false)
    loadRoutines()
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    if (confirm('Delete this routine? All completion history will be lost.')) {
      await deleteRoutine(id)
      loadRoutines()
    }
  }

  async function toggleRoutineItem(routine: Routine, itemId: string) {
    if (!routine.id) return
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let completion = completions[routine.id]
    let completedItems = completion ? [...completion.completedItems] : []
    
    if (completedItems.includes(itemId)) {
      completedItems = completedItems.filter(id => id !== itemId)
    } else {
      completedItems.push(itemId)
    }
    
    const completionRate = Math.round((completedItems.length / routine.items.length) * 100)
    
    if (completion && completion.id) {
      // Update existing completion
      await db.routineCompletions.update(completion.id, {
        completedItems,
        completionRate
      })
    } else {
      // Create new completion
      await addRoutineCompletion({
        routineId: routine.id,
        date: today,
        completedItems,
        completionRate
      })
    }
    
    loadRoutines()
  }

  const totalRoutines = routines.length
  const bestStreak = Math.max(0, ...Object.values(streaks))
  const todayProgress = routines.length > 0
    ? Math.round(
        (Object.values(completions).reduce((sum, c) => sum + c.completionRate, 0) / routines.length)
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Routines
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Build lasting habits with daily routines
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Routine
        </button>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRoutines}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestStreak} days</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Routine</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Routine Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Morning Routine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time of Day *
              </label>
              <select
                required
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value as any })}
                className="input"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Routine Items *
            </label>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={item.id} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => updateItem(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Step ${index + 1}`}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-icon text-red-600 dark:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addNewItem}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add another item
            </button>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create Routine</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Routines List */}
      {routines.length === 0 ? (
        <div className="card text-center py-12">
          <RotateCw className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No routines yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your first routine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {routines.map((routine) => {
            if (!routine.id) return null
            const completion = completions[routine.id]
            const streak = streaks[routine.id] || 0
            const completedItems = completion?.completedItems || []
            const progress = completion?.completionRate || 0

            return (
              <div key={routine.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {routine.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 capitalize">
                        {routine.timeOfDay}
                      </span>
                      {streak > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(routine.id)}
                    className="btn-icon text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Today's Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  {routine.items.map((item) => {
                    const isCompleted = completedItems.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleRoutineItem(routine, item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isCompleted
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-left ${
                          isCompleted
                            ? 'text-gray-600 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
