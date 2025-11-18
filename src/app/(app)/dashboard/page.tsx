'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown, CheckSquare, Heart, Target, RefreshCw, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getTasksCompletedToday, getTotalTasksToday, getAllTasks, getAllRoutines, getFinancialTrendData } from '@/lib/db/queries'
import { formatCurrency } from '@/lib/constants'
import { DataEvents, DATA_EVENTS } from '@/lib/events'
import type { Task, Routine } from '@/lib/db/schema'
import { db } from '@/lib/db/schema'
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations'
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { FinanceTrendChart } from '@/components/charts/finance-trend-chart'

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
  const [userName, setUserName] = useState<string>('')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [financeTrendData, setFinanceTrendData] = useState<Array<{ month: string; income: number; expenses: number }>>([])
  const [chartLoading, setChartLoading] = useState(true)

  const { containerRef, pullHandlers, pullDistance, pullProgress, isRefreshing, showRefreshIndicator } = usePullToRefresh({
    onRefresh: async () => {
      await loadStats()
    }
  })

  useEffect(() => {
    loadUserName()
    loadStats()
    loadChartData()
    
    // Listen to data change events
    DataEvents.on(DATA_EVENTS.INCOME_CHANGED, loadStats)
    DataEvents.on(DATA_EVENTS.EXPENSE_CHANGED, loadStats)
    DataEvents.on(DATA_EVENTS.INCOME_CHANGED, loadChartData)
    DataEvents.on(DATA_EVENTS.EXPENSE_CHANGED, loadChartData)
    DataEvents.on(DATA_EVENTS.TASK_CHANGED, loadStats)
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadUserName)
    DataEvents.on(DATA_EVENTS.SETTINGS_CHANGED, loadStats) // Reload stats when currency changes
    
    return () => {
      DataEvents.off(DATA_EVENTS.INCOME_CHANGED, loadStats)
      DataEvents.off(DATA_EVENTS.EXPENSE_CHANGED, loadStats)
      DataEvents.off(DATA_EVENTS.INCOME_CHANGED, loadChartData)
      DataEvents.off(DATA_EVENTS.EXPENSE_CHANGED, loadChartData)
      DataEvents.off(DATA_EVENTS.TASK_CHANGED, loadStats)
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadUserName)
      DataEvents.off(DATA_EVENTS.SETTINGS_CHANGED, loadStats)
    }
  }, [])

  async function loadUserName() {
    try {
      const settings = await db.settings.get('user_settings')
      if (settings?.name) {
        setUserName(settings.name)
      }
      if (settings?.currency) {
        setCurrency(settings.currency)
      }
    } catch (error) {
      console.error('Failed to load user name:', error)
    }
  }

  async function loadStats() {
    try {
      const startTime = Date.now()
      
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

      // Ensure skeleton shows for at least 300ms for better UX
      const elapsedTime = Date.now() - startTime
      const minDisplayTime = 300
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime)
      
      await new Promise(resolve => setTimeout(resolve, remainingTime))

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

  async function loadChartData() {
    try {
      setChartLoading(true)
      const data = await getFinancialTrendData(6)
      setFinanceTrendData(data)
      setChartLoading(false)
    } catch (error) {
      console.error('Failed to load chart data:', error)
      setChartLoading(false)
    }
  }

  async function handleRefresh() {
    setLoading(true)
    await loadStats()
    await loadChartData()
  }

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
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-opacity"
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
        className="space-y-4 sm:space-y-6"
        style={{ paddingTop: showRefreshIndicator ? `${pullDistance}px` : '0' }}
      >
      {/* Welcome Section */}
      <motion.div 
        {...fadeIn}
        className="flex items-start sm:items-center justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Welcome back{userName ? `, ${userName}` : ''}! 👋
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here's what's happening with your life today
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-icon flex-shrink-0 touch-manipulation"
          title="Refresh stats"
          aria-label="Refresh statistics"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Quick Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* Total Balance */}
          <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">+12.5%</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Balance</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(stats.balance, currency)}</p>
        </motion.div>

        {/* Income This Month */}
        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">This month</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Income</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(stats.monthlyIncome, currency)}</p>
        </motion.div>

        {/* Expenses This Month */}
        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">This month</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(stats.monthlyExpenses, currency)}</p>
        </motion.div>

        {/* Tasks Completed */}
        <motion.div 
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">Today</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Tasks Done</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.tasksCompleted}/{stats.totalTasks}</p>
        </motion.div>
      </motion.div>
      )}

      {/* Financial Trend Chart */}
      <motion.div {...fadeIn} className="card p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Financial Trends (Last 6 Months)
        </h3>
        {chartLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <FinanceTrendChart data={financeTrendData} currency={currency} />
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="card p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <button 
            onClick={() => router.push('/finance?tab=income&add=true')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Add Income</span>
          </button>

          <button 
            onClick={() => router.push('/finance?tab=expenses&add=true')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Add Expense</span>
          </button>

          <button 
            onClick={() => router.push('/tasks?add=true')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Add Task</span>
          </button>

          <button 
            onClick={() => router.push('/health?tab=weight&add=true')}
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Log Health</span>
          </button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Tasks */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
            <button 
              onClick={() => router.push('/tasks')}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
            >
              View all
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <CheckSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-700 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No tasks due today</p>
              <button 
                onClick={() => router.push('/tasks')}
                className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
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
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer touch-manipulation"
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    task.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {task.completed && <CheckSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium truncate ${
                      task.completed
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                  </div>
                  {task.priority && (
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
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
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Daily Routines</h3>
            <button 
              onClick={() => router.push('/routines')}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
            >
              View all
            </button>
          </div>
          {routines.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-700 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No routines set</p>
              <button 
                onClick={() => router.push('/routines')}
                className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline touch-manipulation"
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
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {routine.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
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
      </motion.div>
    </div>
  )
}
