'use client'

interface RoutineHeatmapChartProps {
  data: Array<{
    date: string
    completionRate: number
  }>
}

export function RoutineHeatmapChart({ data }: RoutineHeatmapChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>No routine data available</p>
      </div>
    )
  }

  // Get color based on completion rate
  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-200 dark:bg-gray-700'
    if (rate < 25) return 'bg-red-200 dark:bg-red-900/40'
    if (rate < 50) return 'bg-orange-200 dark:bg-orange-900/40'
    if (rate < 75) return 'bg-yellow-200 dark:bg-yellow-900/40'
    if (rate < 100) return 'bg-green-200 dark:bg-green-900/40'
    return 'bg-green-400 dark:bg-green-600'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {data.map((day, index) => {
          const date = day.date.split(' ')[1] // Get day number
          return (
            <div
              key={index}
              className={`aspect-square rounded-lg ${getColor(day.completionRate)} flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer`}
              title={`${day.date}: ${day.completionRate}% completed`}
            >
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {date}
              </span>
              {day.completionRate > 0 && (
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                  {day.completionRate}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/40" />
          <span>1-24%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-900/40" />
          <span>25-49%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/40" />
          <span>50-74%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40" />
          <span>75-99%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-600" />
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

