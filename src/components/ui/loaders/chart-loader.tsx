import { cn } from '@/lib/utils'
import { Skeleton } from '../skeleton'

interface ChartLoaderProps {
  className?: string
}

export function ChartLoader({ className }: ChartLoaderProps) {
  return (
    <div className={cn('flex flex-col gap-2 aspect-video', className)}>
      <div className="space-y-2 flex-1 flex flex-col">
		<Skeleton className="h-6 w-full rounded-xl" />
		<Skeleton className="h-6 w-full rounded-xl" />
		<Skeleton className="h-6 w-full rounded-xl" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    </div>
  )
}
