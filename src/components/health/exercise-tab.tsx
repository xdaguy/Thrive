'use client'

import { useState, useEffect } from 'react'
import { Plus, Dumbbell, Trash2 } from 'lucide-react'
import { addExercise, getAllExercise, deleteExercise, type Exercise } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'

export function ExerciseTab() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'cardio' as 'cardio' | 'gym' | 'sports' | 'other',
    name: '',
    duration: '',
    sets: '',
    reps: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  useEffect(() => {
    loadExercises()
  }, [])

  async function loadExercises() {
    const data = await getAllExercise()
    setExercises(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await addExercise({
      type: formData.type,
      name: formData.name,
      duration: parseInt(formData.duration),
      sets: formData.sets ? parseInt(formData.sets) : undefined,
      reps: formData.reps ? parseInt(formData.reps) : undefined,
      date: new Date(formData.date),
      note: formData.note
    })

    setFormData({
      type: 'cardio',
      name: '',
      duration: '',
      sets: '',
      reps: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
    setShowForm(false)
    loadExercises()
    DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    if (confirm('Delete this exercise?')) {
      await deleteExercise(id)
      loadExercises()
      DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
    }
  }

  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Exercise Time</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {totalMinutes} min
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {exercises.length} sessions logged
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Exercise
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Exercise</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input"
              >
                <option value="cardio">Cardio</option>
                <option value="gym">Gym</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exercise Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., Running, Bench Press"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
              />
            </div>

            {formData.type === 'gym' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={formData.sets}
                    onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                    className="input"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={formData.reps}
                    onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                    className="input"
                    placeholder="10"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="input"
                placeholder="How did it go?"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No exercises logged yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log your first workout
            </button>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{exercise.name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                      {exercise.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(exercise.date)} • {exercise.duration} min
                    {exercise.sets && exercise.reps && ` • ${exercise.sets}x${exercise.reps}`}
                    {exercise.note && ` • ${exercise.note}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(exercise.id)}
                className="btn-icon text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
