import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
  )
}

// Preset skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
        <Skeleton className="w-12 h-5 rounded" />
      </div>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-7 w-32" />
    </div>
  )
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-6 rounded" />
        </div>
      ))}
    </div>
  )
}
