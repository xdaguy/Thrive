'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown, CheckSquare, Heart, Target, RefreshCw } from 'lucide-react'
import { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getTasksCompletedToday, getTotalTasksToday, getAllTasks, getAllRoutines } from '@/lib/db/queries'
import { formatCurrency } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import type { Task, Routine } from '@/lib/db/schema'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    tasksCompleted: 0,
    totalTasks: 0
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    
    // Listen to data change events
    DataEvents.on(DATA_EVENTS.INCOME_CHANGED, loadStats)
    DataEvents.on(DATA_EVENTS.EXPENSE_CHANGED, loadStats)
    DataEvents.on(DATA_EVENTS.TASK_CHANGED, loadStats)
    
    return () => {
      DataEvents.off(DATA_EVENTS.INCOME_CHANGED, loadStats)
      DataEvents.off(DATA_EVENTS.EXPENSE_CHANGED, loadStats)
      DataEvents.off(DATA_EVENTS.TASK_CHANGED, loadStats)
    }
  }, [])

  async function loadStats() {
    try {
      const now = new Date()
      
      const balance = await getTotalBalance()
      const income = await getMonthlyIncome(now.getFullYear(), now.getMonth())
      const expenses = await getMonthlyExpenses(now.getFullYear(), now.getMonth())
      const completed = await getTasksCompletedToday()
      const total = await getTotalTasksToday()

      // Load actual tasks and routines
      const allTasks = await getAllTasks()
      const allRoutines = await getAllRoutines()

      // Filter tasks for today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todaysTasks = allTasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      }).slice(0, 5) // Show max 5 tasks

      // Set stats and UI state
      setStats({
        balance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        tasksCompleted: completed,
        totalTasks: total
      })
      setTasks(todaysTasks)
      setRoutines(allRoutines.slice(0, 3))
      setLoading(false)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setLoading(true)
    await loadStats()
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="animate-in flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your life today
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-icon"
          title="Refresh stats"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">+12.5%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.balance)}</p>
        </div>

        {/* Income This Month */}
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">This month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Income</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyIncome)}</p>
        </div>

        {/* Expenses This Month */}
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">This month</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyExpenses)}</p>
        </div>

        {/* Tasks Completed */}
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Today</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tasks Done</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasksCompleted}/{stats.totalTasks}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => router.push('/finance')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Income</span>
          </button>

          <button 
            onClick={() => router.push('/finance')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Expense</span>
          </button>

          <button 
            onClick={() => router.push('/tasks')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Task</span>
          </button>

          <button 
            onClick={() => router.push('/health')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Log Health</span>
          </button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
            <button 
              onClick={() => router.push('/tasks')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No tasks due today</p>
              <button 
                onClick={() => router.push('/tasks')}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add a task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => router.push('/tasks')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    task.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      task.completed
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                  </div>
                  {task.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Routines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Routines</h3>
            <button 
              onClick={() => router.push('/routines')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </button>
          </div>
          {routines.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No routines set</p>
              <button 
                onClick={() => router.push('/routines')}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create a routine
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  onClick={() => router.push('/routines')}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {routine.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {routine.timeOfDay} • {routine.items.length} items
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
