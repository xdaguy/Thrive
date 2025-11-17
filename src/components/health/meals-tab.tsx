'use client'

import { useState, useEffect } from 'react'
import { Plus, Coffee, Trash2, Edit, Loader2, Utensils, CheckCircle, XCircle } from 'lucide-react'
import { addMeal, getAllMeals, deleteMeal, updateMeal, type Meal } from '@/lib/db/queries'
import { MEAL_TYPES, formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { db } from '@/lib/db/schema'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface MealsTabProps {
  openForm?: boolean
}

export function MealsTab({ openForm }: MealsTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [meals, setMeals] = useState<Meal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    description: '',
    asExpected: true,
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadMeals()
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

  async function loadMeals() {
    setLoading(true)
    const startTime = Date.now()
    
    const data = await getAllMeals()
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setMeals(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    setSubmitting(true)
    
    const mealData = {
      mealType: formData.mealType,
      description: formData.description,
      asExpected: formData.asExpected,
      date: new Date(formData.date)
    }
    
    try {
      if (editingId) {
        const optimistic = { ...mealData, id: editingId, createdAt: new Date() }
        setMeals(prev => prev.map(m => m.id === editingId ? optimistic : m))
        setEditingId(null)
        setShowForm(false)
        await updateMeal(editingId, mealData)
      } else {
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...mealData, id: tempId, createdAt: new Date() }
        setMeals(prev => [optimistic, ...prev])
        setShowForm(false)
        const realId = await addMeal(mealData)
        setMeals(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempId)
          const withReal = { ...optimistic, id: realId }
          return [withReal, ...withoutTemp]
        })
      }

      setFormData({
        mealType: 'breakfast',
        description: '',
        asExpected: true,
        date: new Date().toISOString().split('T')[0]
      })
      DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      loadMeals()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(meal: Meal) {
    setEditingId(meal.id!)
    setFormData({
      mealType: meal.mealType as any,
      description: meal.description,
      asExpected: meal.asExpected,
      date: new Date(meal.date).toISOString().split('T')[0]
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    setEditingId(null)
    setFormData({
      mealType: 'breakfast',
      description: '',
      asExpected: true,
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    confirmDelete(
      id,
      async () => {
        const deleted = meals.find(m => m.id === id)
        setMeals(prev => prev.filter(m => m.id !== id))
        try {
          await deleteMeal(id)
          DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
        } catch (error) {
          console.error('Failed to delete:', error)
          toast.error('Failed to delete. Please try again.')
          if (deleted) setMeals(prev => [deleted, ...prev])
        }
      },
      'Delete Meal Entry',
      'Are you sure you want to delete this meal entry?'
    )
  }

  const adherenceRate = meals.length > 0
    ? Math.round((meals.filter(m => m.asExpected).length / meals.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Meal Adherence</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {adherenceRate}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {meals.length} meals logged
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Meal
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? 'Edit Meal' : 'Log Meal'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Type *
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value as any })}
                className="input"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[80px]"
                placeholder="What did you eat?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.asExpected}
                  onChange={(e) => setFormData({ ...formData, asExpected: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Ate as expected (healthy/planned)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
          </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : meals.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No meals logged yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log your first meal
            </button>
          </div>
        ) : (
          meals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {meal.mealType}
                    </h4>
                    {meal.asExpected ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {meal.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(meal.date, dateFormat)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(meal)}
                  className="btn-icon text-blue-600 dark:text-blue-400"
                  title="Edit meal"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(meal.id)}
                  className="btn-icon text-red-600 dark:text-red-400"
                  title="Delete meal"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  )
}
