'use client'

import { useState, useEffect } from 'react'
import { Plus, Scale, Trash2, Edit, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { addWeight, getAllWeight, deleteWeight, updateWeight, type Weight } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { haptics } from '@/lib/haptics'
import { useSwipeToDelete } from '@/hooks/use-swipe'

interface WeightTabProps {
  openForm?: boolean
}

// Swipeable Weight Item Wrapper
interface SwipeableWeightItemProps {
  weight: Weight
  dateFormat: string
  onEdit: (weight: Weight) => void
  onDelete: (id: string) => void
}

function SwipeableWeightItem({ weight, dateFormat, onEdit, onDelete }: SwipeableWeightItemProps) {
  const { swipeHandlers, swipeStyle } = useSwipeToDelete(() => {
    onDelete(weight.id!)
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {weight.weight} {weight.unit}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(weight.date, dateFormat)}
              {weight.note && ` • ${weight.note}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(weight)}
            className="btn-icon text-blue-600 dark:text-blue-400"
            title="Edit weight"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(weight.id!)}
            className="btn-icon text-red-600 dark:text-red-400"
            title="Delete weight"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function WeightTab({ openForm }: WeightTabProps = {}) {
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [weights, setWeights] = useState<Weight[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  useEffect(() => {
    loadWeights()
    loadWeightUnit()

    // Listen for settings changes
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadWeightUnit)

    return () => {
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadWeightUnit)
    }
  }, [])

  useEffect(() => {
    // Auto-open form when openForm prop is true
    if (openForm) {
      setShowForm(true)
    }
  }, [openForm])

  async function loadWeightUnit() {
    try {
      const settings = await db.settings.get('user_settings')
      if (settings?.weightUnit) {
        setWeightUnit(settings.weightUnit)
      }
      if (settings?.dateFormat) {
        setDateFormat(settings.dateFormat)
      }
    } catch (error) {
      console.error('Failed to load weight unit:', error)
    }
  }

  async function loadWeights() {
    setLoading(true)
    const startTime = Date.now()
    
    const data = await getAllWeight()
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setWeights(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    haptics.light()
    
    // Validation
    const weight = parseFloat(formData.weight)
    if (weight <= 0) {
      toast.error('Weight must be greater than 0')
      return
    }
    if (weight > 1000) {
      toast.error('Weight seems unrealistic. Please check.')
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
    const weightData = {
      weight,
      unit: weightUnit,
      date: new Date(formData.date),
      note: formData.note
    }
    
    try {
      if (editingId) {
        const optimistic = { ...weightData, id: editingId, createdAt: new Date() }
        setWeights(prev => prev.map(w => w.id === editingId ? optimistic : w))
        setEditingId(null)
        setShowForm(false)
        await updateWeight(editingId, weightData)
      } else {
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...weightData, id: tempId, createdAt: new Date() }
        setWeights(prev => [optimistic, ...prev])
        setShowForm(false)
        const realId = await addWeight(weightData)
        setWeights(prev => {
          const withoutTemp = prev.filter(w => w.id !== tempId)
          const withReal = { ...optimistic, id: realId }
          return [withReal, ...withoutTemp]
        })
      }

      setFormData({
        weight: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      })
      DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      haptics.error()
      loadWeights()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(weight: Weight) {
    haptics.light()
    setEditingId(weight.id!)
    setFormData({
      weight: weight.weight.toString(),
      date: new Date(weight.date).toISOString().split('T')[0],
      note: weight.note || ''
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    haptics.light()
    setEditingId(null)
    setFormData({
      weight: '',
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
      await deleteWeight(id)
      setWeights(prev => prev.filter(w => w.id !== id))
      DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to delete weight:', error)
      toast.error('Failed to delete')
      haptics.error()
      loadWeights()
    }
  }

  const latestWeight = weights[0]
  const previousWeight = weights[1]
  const weightChange = latestWeight && previousWeight 
    ? latestWeight.weight - previousWeight.weight 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {latestWeight ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Weight</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {latestWeight.weight} {latestWeight.unit}
              </p>
              {weightChange !== 0 && (
                <p className={`text-sm flex items-center gap-1 mt-1 ${
                  weightChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weightChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(weightChange).toFixed(1)} {latestWeight.unit}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">No weight recorded</p>
              <p className="text-3xl font-bold text-gray-400">--</p>
            </>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Weight
        </button>
      </div>

      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Weight' : 'Log Weight'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight ({weightUnit}) *
              </label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input"
                placeholder="0.0"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unit preference: {weightUnit} (change in Settings)
              </p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Date picker format is controlled by your browser
              </p>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="input"
                placeholder="Optional note..."
              />
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
      </BottomSheet>

      <div className="space-y-3">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : weights.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No weight entries yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log your first weight
            </button>
          </div>
        ) : (
          weights.map((weight) => (
            <SwipeableWeightItem
              key={weight.id}
              weight={weight}
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
