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
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { haptics } from '@/lib/haptics'
import { useDeleteConfirm } from '@/components/ui/delete-confirm'
import { useSwipeToDelete } from '@/hooks/use-swipe'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { TaskCompletionChart } from '@/components/charts/task-completion-chart'
import { getTaskCompletionData } from '@/lib/db/queries'
import { useSearchFilter } from '@/hooks/use-search-filter'
import { SearchBar } from '@/components/ui/search-bar'
import { QuickFilters } from '@/components/ui/quick-filters'
import { SortButton } from '@/components/ui/sort-button'
import { ExportButton } from '@/components/ui/export-button'
import { exportTasksToCSV } from '@/lib/export'
import { DateRangePicker } from '@/components/ui/date-range-picker'

// Swipeable Task Item Wrapper
interface SwipeableTaskItemProps {
  task: Task
  dateFormat: string
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function SwipeableTaskItem({ task, dateFormat, onToggle, onEdit, onDelete }: SwipeableTaskItemProps) {
  const { swipeHandlers, swipeStyle } = useSwipeToDelete(() => {
    onDelete(task.id!)
  })

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-white dark:bg-[#1A1A1A] ${
      task.completed
        ? 'border-green-200 dark:border-green-900/30'
        : 'border-gray-200 dark:border-gray-800'
    }`}>
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 dark:bg-red-600 flex items-center justify-end px-6">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Main Content */}
      <motion.div
        {...listItem}
        layout
        whileHover={{ scale: 1.01, y: -2 }}
        {...swipeHandlers}
        style={swipeStyle}
        className={`relative flex items-start gap-4 p-4 bg-white dark:bg-[#1A1A1A] transition-all hover:shadow-md ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        <button
          onClick={() => onToggle(task.id!)}
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
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {formatDate(task.dueDate, dateFormat)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="btn-icon text-blue-600 dark:text-blue-400"
            aria-label={`Edit task: ${task.title}`}
            title="Edit"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(task.id!)}
            className="btn-icon text-red-600 dark:text-red-400"
            aria-label={`Delete task: ${task.title}`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

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
  const [taskCompletionData, setTaskCompletionData] = useState<Array<{ date: string; completed: number; total: number }>>([])
  const [chartLoading, setChartLoading] = useState(true)

  const { containerRef, pullHandlers, pullDistance, pullProgress, isRefreshing, showRefreshIndicator } = usePullToRefresh({
    onRefresh: async () => {
      await loadTasks()
      await loadChartData()
    }
  })


  async function loadChartData() {
    try {
      setChartLoading(true)
      const data = await getTaskCompletionData(7) // Last 7 days
      setTaskCompletionData(data)
      setChartLoading(false)
    } catch (error) {
      console.error('Failed to load chart data:', error)
      setChartLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
    loadDateFormat()
    loadChartData()

    // Listen for changes
    DataEvents.on(DATA_EVENTS.TASK_CHANGED, loadChartData)
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadDateFormat)

    return () => {
      DataEvents.off(DATA_EVENTS.TASK_CHANGED, loadChartData)
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
    haptics.light()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      haptics.error()
      return
    }
    if (formData.title.length > 200) {
      toast.error('Title is too long (max 200 characters)')
      return
    }
    
    setSubmitting(true)
    haptics.medium()
    
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
        setTasks(prev => {
          const withoutTemp = prev.filter(t => t.id !== tempId)
          const withReal = { ...optimistic, id: realId }
          return [withReal, ...withoutTemp]
        })
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
      haptics.success()
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save. Please try again.')
      haptics.error()
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
    haptics.light()
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
    haptics.light()
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

  async function handleDelete(id: string) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    haptics.medium()
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      loadTasks()
      DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
      haptics.success()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete')
      haptics.error()
      loadTasks()
    }
  }

  // Apply status filter first
  const statusFilteredTasks = tasks.filter(task => {
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

  // Search and filter
  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filters: searchFilters,
    filteredItems: filteredTasks,
    hasActiveFilters,
    handleSort,
    updateFilters,
    resetFilters
  } = useSearchFilter(statusFilteredTasks, {
    searchFields: ['title', 'description', 'category', 'tags'],
    sortableFields: ['dueDate', 'priority', 'title', 'createdAt'],
    defaultSortField: 'dueDate',
    defaultSortDirection: 'asc'
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
    <div
      ref={containerRef}
      {...pullHandlers}
      className="relative overflow-y-auto h-full"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Pull-to-Refresh Indicator */}
      {showRefreshIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-opacity z-50"
          style={{ 
            height: `${pullDistance}px`,
            opacity: pullProgress 
          }}
        >
          <Loader2 
            className={`w-6 h-6 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: `rotate(${pullProgress * 360}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.2s ease'
            }}
          />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
        style={{ paddingTop: showRefreshIndicator ? `${pullDistance}px` : '0' }}
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
          aria-label="Add new task"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Add Task
        </button>
      </motion.div>

      {/* Task Completion Chart */}
      <motion.div {...fadeIn} className="card p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Task Completion (Last 7 Days)
        </h3>
        {chartLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <TaskCompletionChart data={taskCompletionData} />
        )}
      </motion.div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks by title, description, category, or tags..."
        />
        {/* Custom Date Range (for Due Date filtering) */}
        <DateRangePicker
          startDate={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : null}
          endDate={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : null}
          onChange={(start, end) => {
            updateFilters({
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
            <SortButton label="Due Date" field="dueDate" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Priority" field="priority" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <SortButton label="Title" field="title" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Reset search filters
          </button>
        )}
        
        {/* Export Button */}
        {filteredTasks.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <ExportButton
              onClick={() => exportTasksToCSV(filteredTasks, dateFormat)}
              label="Export Tasks"
            />
          </div>
        )}
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

      {/* Add Form - BottomSheet */}
      <BottomSheet
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? 'Edit Task' : 'Add Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoFocus
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
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
              aria-label={editingId ? 'Save task changes' : 'Add task'}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {editingId ? 'Update Task' : 'Save Task'}
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
              <SwipeableTaskItem
                key={task.id}
                task={task}
                dateFormat={dateFormat}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
          ))}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
      </motion.div>
    </div>
  )
}
