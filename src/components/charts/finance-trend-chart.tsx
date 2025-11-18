'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/constants'

interface FinanceTrendChartProps {
  data: Array<{
    month: string
    income: number
    expenses: number
  }>
  currency?: string
}

export function FinanceTrendChart({ data, currency = 'USD' }: FinanceTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      net: item.income - item.expenses
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.month}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>No financial data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis
          dataKey="month"
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => {
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
            return `$${value}`
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '14px' }}
          iconType="circle"
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ fill: '#EF4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

