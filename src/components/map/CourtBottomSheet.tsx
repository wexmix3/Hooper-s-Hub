'use client'

import { useRouter } from 'next/navigation'
import { X, MapPin, Star, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CrowdBadge } from '@/components/courts/CrowdBadge'
import type { Court } from '@/types'
import { formatDistance, formatPrice, BOROUGH_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CourtBottomSheetProps {
  court: Court | null
  onClose: () => void
  userCoords?: { lat: number; lng: number } | null
}

export function CourtBottomSheet({ court, onClose, userCoords }: CourtBottomSheetProps) {
  const router = useRouter()

  if (!court) return null

  const distance = userCoords
    ? court.distance_miles
    : undefined

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 sheet-slide-up">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0 bottom-auto h-screen" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[50vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X size={16} className="text-slate-500" />
        </button>

        <div className="px-5 pb-5 pt-2">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 text-lg leading-tight">{court.name}</h2>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <MapPin size={12} />
                <span className="truncate">{court.address}</span>
              </div>
            </div>
            <span
              className={cn(
                'flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full',
                court.type === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              )}
            >
              {court.type === 'private' ? 'Private' : 'Public'}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            {distance !== undefined && (
              <span className="text-slate-500">{formatDistance(distance)} away</span>
            )}
            {court.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-slate-600">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-medium">{court.avg_rating.toFixed(1)}</span>
              </div>
            )}
            {court.latest_crowd && (
              <CrowdBadge level={court.latest_crowd.crowd_level} size="sm" />
            )}
            {court.is_bookable && court.hourly_rate && (
              <div className="flex items-center gap-1 text-[#FF6B2C] font-bold ml-auto">
                <Zap size={12} />
                {formatPrice(court.hourly_rate)}/hr
              </div>
            )}
          </div>

          {/* CTA */}
          <Button
            className="w-full"
            onClick={() => router.push(`/courts/${court.id}`)}
          >
            View Details {court.is_bookable ? '& Book' : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
