'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckSquare, Square, Trash2, Calendar } from 'lucide-react'
import { addTask, getAllTasks, toggleTaskCompletion, deleteTask, type Task } from '@/lib/db/queries'
import { formatDate } from '@/lib/constants'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
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
    
    await addTask({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      completed: false
    })

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
  }

  async function handleToggle(id: string | undefined) {
    if (!id) return
    await toggleTaskCompletion(id)
    loadTasks()
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return
    if (confirm('Delete this task?')) {
      await deleteTask(id)
      loadTasks()
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length

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
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 dark:bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Task</h3>
          
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
            <button type="submit" className="btn-primary">Save Task</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
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

              <button
                onClick={() => handleDelete(task.id)}
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
