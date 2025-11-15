'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckSquare, Square, Trash2, Calendar, Edit, Filter } from 'lucide-react'
import { addTask, getAllTasks, toggleTaskCompletion, deleteTask, updateTask, type Task } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'today'>('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    category: '',
    tags: ''
  })

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    const data = await getAllTasks()
    setTasks(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    if (formData.title.length > 200) {
      alert('Title is too long (max 200 characters)')
      return
    }
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      completed: false
    }
    
    if (editingId) {
      // Update existing task
      await updateTask(editingId, taskData)
      setEditingId(null)
    } else {
      // Add new task
      await addTask(taskData)
    }

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: '',
      tags: ''
    })
    setShowForm(false)
    loadTasks()
    DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
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
    if (confirm('Delete this task?')) {
      await deleteTask(id)
      loadTasks()
      DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      </div>

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
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
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
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Task' : 'Save Task'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
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
          filteredTasks.map((task) => (
            <div
              key={task.id}
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
                      {formatDate(task.dueDate)}
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
