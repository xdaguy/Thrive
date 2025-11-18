'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TaskCompletionChartProps {
  data: Array<{
    date: string
    completed: number
    total: number
  }>
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total
      const completed = payload[0].payload.completed
      const pending = total - completed
      const rate = total > 0 ? ((completed / total) * 100).toFixed(0) : 0
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.date}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed: <span className="font-semibold text-green-600 dark:text-green-400">{completed}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending: <span className="font-semibold text-orange-600 dark:text-orange-400">{pending}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rate: <span className="font-semibold text-blue-600 dark:text-blue-400">{rate}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>No task data available</p>
      </div>
    )
  }

  // Calculate pending tasks for each day
  const chartData = data.map(item => ({
    ...item,
    pending: item.total - item.completed
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '14px' }}
          iconType="square"
        />
        <Bar
          dataKey="completed"
          name="Completed"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pending"
          name="Pending"
          fill="#F59E0B"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

