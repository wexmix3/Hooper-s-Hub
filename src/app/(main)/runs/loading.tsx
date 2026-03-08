import { RunCardSkeleton } from '@/components/ui/Skeleton'

export default function RunsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 space-y-3">
        <div className="h-7 w-36 bg-slate-200 animate-pulse rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-8 w-20 bg-slate-200 animate-pulse rounded-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <RunCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
