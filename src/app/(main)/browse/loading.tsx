import { CourtCardSkeleton } from '@/components/ui/Skeleton'

export default function BrowseLoading() {
  return (
    <div className="px-4 py-4">
      <div className="h-10 bg-slate-200 animate-pulse rounded-xl mb-4" />
      <div className="flex gap-2 mb-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 h-8 w-20 bg-slate-200 animate-pulse rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourtCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
