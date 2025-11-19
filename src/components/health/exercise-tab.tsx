'use client'

import { useState, useEffect } from 'react'
import { Plus, Activity, Trash2, Edit, Loader2, Dumbbell } from 'lucide-react'
import { addExercise, getAllExercise, deleteExercise, updateExercise, type Exercise } from '@/lib/db/queries'
import { EXERCISE_TYPES, formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { haptics } from '@/lib/haptics'
import { useSwipeToDelete } from '@/hooks/use-swipe'
import { useSearchFilter } from '@/hooks/use-search-filter'
import { SearchBar } from '@/components/ui/search-bar'
import { QuickFilters } from '@/components/ui/quick-filters'
import { SortButton } from '@/components/ui/sort-button'
import { ExportButton } from '@/components/ui/export-button'
import { exportExerciseToCSV } from '@/lib/export'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface ExerciseTabProps {
  openForm?: boolean
}

// Swipeable Exercise Item Wrapper
interface SwipeableExerciseItemProps {
  exercise: Exercise
  dateFormat: string
  onEdit: (exercise: Exercise) => void
  onDelete: (id: string) => void
}

function SwipeableExerciseItem({ exercise, dateFormat, onEdit, onDelete }: SwipeableExerciseItemProps) {
  const { swipeHandlers, swipeStyle } = useSwipeToDelete(() => {
    onDelete(exercise.id!)
  })

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 dark:bg-red-600 flex items-center justify-end px-6">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Main Content */}
      <div
        {...swipeHandlers}
        style={swipeStyle}
        className="relative flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800"
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
              {formatDate(exercise.date, dateFormat)} • {exercise.duration} min
              {exercise.sets && exercise.reps && ` • ${exercise.sets}x${exercise.reps}`}
              {exercise.note && ` • ${exercise.note}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(exercise)}
            className="btn-icon text-blue-600 dark:text-blue-400"
            aria-label={`Edit exercise from ${formatDate(exercise.date, dateFormat)}`}
            title="Edit exercise"
          >
            <Edit className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(exercise.id!)}
            className="btn-icon text-red-600 dark:text-red-400"
            aria-label={`Delete exercise from ${formatDate(exercise.date, dateFormat)}`}
            title="Delete exercise"
          >
            <Trash2 className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExerciseTab({ openForm }: ExerciseTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'cardio' as 'cardio' | 'gym' | 'sports' | 'other',
    name: '',
    duration: '',
    sets: '',
    reps: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  // Search and filter
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filters,
    filteredItems: filteredExercises,
    hasActiveFilters,
    handleSort,
    updateFilters,
    resetFilters
  } = useSearchFilter(exercises, {
    searchFields: ['name', 'type', 'note'],
    sortableFields: ['date', 'name', 'type', 'duration'],
    defaultSortField: 'date',
    defaultSortDirection: 'desc'
  })

  useEffect(() => {
    loadExercises()
    loadDateFormat()

    // Listen for settings changes
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadDateFormat)

    return () => {
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadDateFormat)
    }
  }, [])

  useEffect(() => {
    // Auto-open form when openForm prop is true
    if (openForm) {
      setShowForm(true)
    }
  }, [openForm])

  async function loadDateFormat() {
    try {
      const settings = await db.settings.get('user_settings')
      if (settings?.dateFormat) {
        setDateFormat(settings.dateFormat)
      }
    } catch (error) {
      console.error('Failed to load date format:', error)
    }
  }

  async function loadExercises() {
    setLoading(true)
    const startTime = Date.now()
    
    const data = await getAllExercise()
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setExercises(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    haptics.light()
    
    // Validation
    const duration = parseInt(formData.duration)
    if (duration <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }
    if (duration > 1440) {
      toast.error('Duration seems too long (max 24 hours)')
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
    const exerciseData = {
      type: formData.type,
      name: formData.name,
      duration,
      sets: formData.sets ? parseInt(formData.sets) : undefined,
      reps: formData.reps ? parseInt(formData.reps) : undefined,
      date: new Date(formData.date),
      note: formData.note
    }
    
    try {
      if (editingId) {
        const optimistic = { ...exerciseData, id: editingId, createdAt: new Date() }
        setExercises(prev => prev.map(e => e.id === editingId ? optimistic : e))
        setEditingId(null)
        setShowForm(false)
        await updateExercise(editingId, exerciseData)
      } else {
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...exerciseData, id: tempId, createdAt: new Date() }
        setExercises(prev => [optimistic, ...prev])
        setShowForm(false)
        const realId = await addExercise(exerciseData)
        setExercises(prev => {
          const withoutTemp = prev.filter(e => e.id !== tempId)
          const withReal = { ...optimistic, id: realId }
          return [withReal, ...withoutTemp]
        })
      }

      setFormData({
        type: 'cardio',
        name: '',
        duration: '',
        sets: '',
        reps: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      })
      DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      haptics.error()
      loadExercises()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(exercise: Exercise) {
    haptics.light()
    setEditingId(exercise.id!)
    setFormData({
      type: exercise.type as any,
      name: exercise.name,
      duration: exercise.duration.toString(),
      sets: exercise.sets?.toString() || '',
      reps: exercise.reps?.toString() || '',
      date: new Date(exercise.date).toISOString().split('T')[0],
      note: exercise.note || ''
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    haptics.light()
    setEditingId(null)
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
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    haptics.medium()
    try {
      await deleteExercise(id)
      setExercises(prev => prev.filter(e => e.id !== id))
      DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to delete exercise:', error)
      toast.error('Failed to delete')
      haptics.error()
      loadExercises()
    }
  }

  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search exercises by name, type, or note..."
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Period</p>
          <QuickFilters
            value={filters.quickFilter || 'all'}
            onChange={(value) => {
              updateFilters({ quickFilter: value, dateRange: undefined })
            }}
          />
        </div>

        {/* Custom Date Range */}
        <DateRangePicker
          startDate={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : null}
          endDate={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : null}
          onChange={(start, end) => {
            updateFilters({
              quickFilter: 'all',
              dateRange: {
                start: start ? new Date(start) : null,
                end: end ? new Date(end + 'T23:59:59') : null
              }
            })
          }}
          onClear={() => updateFilters({ dateRange: undefined })}
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</p>
          <div className="flex flex-wrap gap-2">
            <SortButton label="Date" field="date" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Name" field="name" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Type" field="type" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Duration" field="duration" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Reset all filters
          </button>
        )}
        
        {/* Export Button */}
        {filteredExercises.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <ExportButton
              onClick={() => exportExerciseToCSV(filteredExercises, dateFormat)}
              label="Export Exercise Data"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Exercise Time</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {totalMinutes} min
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredExercises.length} sessions logged
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          aria-label="Log new exercise entry"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Log Exercise
        </button>
      </div>

      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Exercise' : 'Log Exercise'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
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
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
              aria-label={editingId ? 'Save exercise changes' : 'Add exercise entry'}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {editingId ? 'Update' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={handleCancelEdit} 
              className="btn-secondary" 
              disabled={submitting}
              aria-label="Cancel and close form"
            >
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>

      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : exercises.length === 0 ? (
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
          filteredExercises.map((exercise) => (
            <SwipeableExerciseItem
              key={exercise.id}
              exercise={exercise}
              dateFormat={dateFormat}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  )
}
