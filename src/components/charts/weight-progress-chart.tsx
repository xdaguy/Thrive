'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface WeightProgressChartProps {
  data: Array<{
    date: string
    weight: number
  }>
  goalWeight?: number
}

export function WeightProgressChart({ data, goalWeight }: WeightProgressChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Weight: <span className="font-semibold text-gray-900 dark:text-white">
              {payload[0].value} kg
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>No weight data available</p>
      </div>
    )
  }

  const minWeight = Math.min(...data.map(d => d.weight), goalWeight || Infinity)
  const maxWeight = Math.max(...data.map(d => d.weight), goalWeight || -Infinity)
  const padding = (maxWeight - minWeight) * 0.1 || 5
  const yDomain = [Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
          domain={yDomain}
          tickFormatter={(value) => `${value}kg`}
        />
        <Tooltip content={<CustomTooltip />} />
        {goalWeight && (
          <ReferenceLine 
            y={goalWeight} 
            stroke="#10B981" 
            strokeDasharray="3 3"
            label={{ 
              value: `Goal: ${goalWeight}kg`, 
              position: 'right',
              fill: '#10B981',
              fontSize: 12
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={{ fill: '#8B5CF6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

