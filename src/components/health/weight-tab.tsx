'use client'

import { useState, useEffect } from 'react'
import { Plus, Scale, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { addWeight, getAllWeight, deleteWeight, type Weight } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'

export function WeightTab() {
  const [weights, setWeights] = useState<Weight[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    weight: '',
    unit: 'kg' as 'kg' | 'lbs',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  useEffect(() => {
    loadWeights()
  }, [])

  async function loadWeights() {
    const data = await getAllWeight()
    setWeights(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await addWeight({
      weight: parseFloat(formData.weight),
      unit: formData.unit,
      date: new Date(formData.date),
      note: formData.note
    })

    setFormData({
      weight: '',
      unit: formData.unit,
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
    setShowForm(false)
    loadWeights()
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    if (confirm('Delete this weight entry?')) {
      await deleteWeight(id)
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

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Weight</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="input"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
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
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {weights.length === 0 ? (
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
            <div
              key={weight.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
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
                    {formatDate(weight.date)}
                    {weight.note && ` • ${weight.note}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(weight.id)}
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
