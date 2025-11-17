'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, CheckCircle2, Circle, Trash2, Edit, Calendar, Tag, AlertCircle, Loader2, Filter, CheckSquare, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { addTask, getAllTasks, toggleTaskCompletion, deleteTask, updateTask, type Task } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import { db } from '@/lib/db/schema'
import { fadeIn, listItem, staggerContainer, staggerItem } from '@/lib/animations'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'

export default function TasksPage() {
  const searchParams = useSearchParams()
  const { confirm: confirmDelete, DeleteDialog } = useDeleteConfirm()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'today'>('all')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: '',
    tags: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTasks()
    loadDateFormat()

    // Listen for settings changes
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadDateFormat)

    return () => {
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadDateFormat)
    }
  }, [])

  useEffect(() => {
    // Auto-open form when add parameter is present
    const add = searchParams.get('add')
    if (add === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

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

  async function loadTasks() {
    setLoading(true)
    const startTime = Date.now()
    
    const data = await getAllTasks()
    
    // Ensure skeleton shows for at least 300ms
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 300 - elapsedTime)
    await new Promise(resolve => setTimeout(resolve, remainingTime))
    
    setTasks(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (formData.title.length > 200) {
      toast.error('Title is too long (max 200 characters)')
      return
    }
    
    setSubmitting(true)
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      completed: false
    }
    
    try {
      if (editingId) {
        const optimistic = { ...taskData, id: editingId, createdAt: new Date(), updatedAt: new Date() }
        setTasks(prev => prev.map(t => t.id === editingId ? optimistic : t))
        setEditingId(null)
        setShowForm(false)
        await updateTask(editingId, taskData)
      } else {
        const tempId = `temp-${Date.now()}`
        const optimistic = { ...taskData, id: tempId, createdAt: new Date(), updatedAt: new Date() }
        setTasks(prev => [optimistic, ...prev])
        setShowForm(false)
        const realId = await addTask(taskData)
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: realId } : t))
      }

      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        category: '',
        tags: ''
      })
      DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      loadTasks()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id: string | undefined) {
    if (!id) return
    await toggleTaskCompletion(id)
    loadTasks()
    DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
  }

  async function handleEdit(task: Task) {
    setEditingId(task.id!)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority as any,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      category: task.category || '',
      tags: task.tags ? task.tags.join(', ') : ''
    })
    setShowForm(true)
  }
  
  function handleCancelEdit() {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: '',
      tags: ''
    })
    setShowForm(false)
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    confirmDelete(
      id,
      async () => {
        const deleted = tasks.find(t => t.id === id)
        setTasks(prev => prev.filter(t => t.id !== id))
        try {
          await deleteTask(id)
          DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
        } catch (error) {
          console.error('Failed to delete:', error)
          toast.error('Failed to delete. Please try again.')
          if (deleted) setTasks(prev => [deleted, ...prev])
        }
      },
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.'
    )
  }

  const filteredTasks = tasks.filter(task => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    if (dueDate) dueDate.setHours(0, 0, 0, 0)
    
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    if (filter === 'overdue') {
      return !task.completed && dueDate && dueDate < now
    }
    if (filter === 'today') {
      return !task.completed && dueDate && dueDate.getTime() === now.getTime()
    }
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length
  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < now
  }).length
  const todayCount = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === now.getTime()
  }).length

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tasks
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Today ({todayCount})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : overdueCount > 0
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
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
            {editingId ? 'Edit Task' : 'Add Task'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Add details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="e.g., Work, Personal"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Update Task' : 'Save Task'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
          </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-2">
        {loading ? (
          <SkeletonTable rows={4} />
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 card">
            <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                {...listItem}
                layout
                whileHover={{ scale: 1.01, y: -2 }}
                className={`flex items-start gap-4 p-4 bg-white dark:bg-[#1A1A1A] border rounded-xl transition-all hover:shadow-md ${
                task.completed
                  ? 'border-green-200 dark:border-green-900/30 opacity-60'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <button
                onClick={() => handleToggle(task.id)}
                className="mt-1 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Square className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-gray-900 dark:text-white ${
                  task.completed ? 'line-through' : ''
                }`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {task.priority}
                  </span>
                  {task.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {task.category}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.dueDate, dateFormat)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!task.completed && (
                  <button
                    onClick={() => handleEdit(task)}
                    className="btn-icon text-blue-600 dark:text-blue-400"
                    title="Edit task"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="btn-icon text-red-600 dark:text-red-400"
                  title="Delete task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </motion.div>
  )
}
