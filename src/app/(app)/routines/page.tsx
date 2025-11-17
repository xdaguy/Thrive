'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Repeat, Trash2, Edit, Loader2, RotateCw, Trophy, Target, X, CheckCircle, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { haptics } from '@/lib/haptics'
import { 
  addRoutine, 
  getAllRoutines, 
  deleteRoutine,
  updateRoutine,
  getTodayRoutineCompletion,
  addRoutineCompletion,
  getRoutineStreak 
} from '@/lib/db/queries'
import { generateId, db } from '@/lib/db/schema'
import type { Routine, RoutineItem, RoutineCompletion } from '@/lib/db/schema'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { fadeIn, staggerContainer, staggerItem, scaleIn } from '@/lib/animations'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/providers/error-boundary'

export default function RoutinesPage() {
  const searchParams = useSearchParams()
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [completions, setCompletions] = useState<Record<string, RoutineCompletion>>({})
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    items: [{ id: generateId(), name: '', order: 0 }]
  })

  useEffect(() => {
    loadRoutines()
  }, [])

  async function loadRoutines() {
    setLoading(true)
    const startTime = Date.now()
    
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
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setLoading(false)
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
    haptics.light()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Routine name is required')
      haptics.error()
      return
    }
    const validItems = formData.items.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      toast.error('At least one routine item is required')
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
    const routineData = {
      name: formData.name.trim(),
      timeOfDay: formData.timeOfDay,
      items: validItems
    }
    
    try {
      if (editingId) {
        const optimistic = { ...routineData, id: editingId, createdAt: new Date(), updatedAt: new Date() }
        setRoutines(prev => prev.map(r => r.id === editingId ? optimistic : r))
        setEditingId(null)
        setShowForm(false)
        await updateRoutine(editingId, routineData)
      } else {
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...routineData, id: tempId, createdAt: new Date(), updatedAt: new Date() }
        setRoutines(prev => [optimistic, ...prev])
        setShowForm(false)
        const realId = await addRoutine(routineData)
        setRoutines(prev => {
          const withoutTemp = prev.filter(r => r.id !== tempId)
          const withReal = { ...optimistic, id: realId }
          return [withReal, ...withoutTemp]
        })
      }

      setFormData({
        name: '',
        timeOfDay: 'morning',
        items: [{ id: generateId(), name: '', order: 0 }]
      })
      DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      haptics.error()
      loadRoutines()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(routine: Routine) {
    haptics.light()
    setEditingId(routine.id!)
    setFormData({
      name: routine.name,
      timeOfDay: routine.timeOfDay,
      items: routine.items.map((item, index) => ({
        id: item.id || generateId(),
        name: item.name,
        order: index
      }))
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    haptics.light()
    setEditingId(null)
    setFormData({
      name: '',
      timeOfDay: 'morning',
      items: [{ id: generateId(), name: '', order: 0 }]
    })
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    haptics.medium()
    try {
      await deleteRoutine(id)
      setRoutines(prev => prev.filter(r => r.id !== id))
      loadRoutines()
      DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to delete routine:', error)
      toast.error('Failed to delete')
      haptics.error()
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
    DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
  }

  const totalRoutines = routines.length
  const bestStreak = Math.max(0, ...Object.values(streaks))
  const todayProgress = routines.length > 0
    ? Math.round(
        (Object.values(completions).reduce((sum, c) => sum + c.completionRate, 0) / routines.length)
      )
    : 0

  return (
    <ErrorBoundary>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Daily Routines
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Build lasting habits
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base py-2 sm:py-2.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create</span>
          <span className="sm:hidden">New</span>
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Routines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRoutines}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{bestStreak} days</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayProgress}%</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Form - BottomSheet */}
      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Routine' : 'Create Routine'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
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
                      aria-label={`Remove item: ${item.name || 'Untitled'}`}
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
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Update Routine' : 'Create Routine'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Routines List */}
      {loading ? (
        <SkeletonTable rows={3} />
      ) : routines.length === 0 ? (
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
              <div key={routine.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                      {routine.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 capitalize">
                        {routine.timeOfDay}
                      </span>
                      {streak > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {streak}d
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(routine)}
                      className="btn-icon text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="btn-icon text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-1.5 sm:space-y-2">
                  {routine.items.map((item) => {
                    const isCompleted = completedItems.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleRoutineItem(routine, item.id)}
                        className={`w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg transition-all touch-manipulation ${
                          isCompleted
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm sm:text-base text-left ${
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

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </motion.div>
    </ErrorBoundary>
  )
}
