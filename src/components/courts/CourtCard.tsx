'use client'

import Link from 'next/link'
import { MapPin, Star, Zap } from "lucide-react"
import { Badge } from '@/components/ui/Badge'
import { CrowdBadge } from './CrowdBadge'
import { CourtImage } from './CourtImage'
import type { Court } from '@/types'
import { formatDistance, formatPrice, BOROUGH_LABELS } from '@/lib/utils'

interface CourtCardProps {
  court: Court
}

export function CourtCard({ court }: CourtCardProps) {
  return (
    <Link href={`/courts/${court.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-shadow duration-200 group-hover:shadow-md active:scale-[0.99]">
        {/* Photo */}
        <div className="relative h-44 bg-slate-200 overflow-hidden">
          <CourtImage
            photos={court.photos ?? []}
            courtId={court.id}
            courtName={court.name}
            isIndoor={court.indoor}
            alt={court.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {court.booking_status === 'coming_soon' ? (
              <Badge variant="warning">Coming Soon</Badge>
            ) : (
              <Badge variant={court.type === 'private' ? 'info' : 'success'}>
                {court.type === 'private' ? 'Private' : 'Public'}
              </Badge>
            )}
          </div>
          {court.indoor && (
            <div className="absolute top-2 right-2">
              <Badge variant="default">Indoor</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-900 text-base leading-tight mb-0.5">{court.name}</h3>
          {court.neighborhood && (
            <p className="text-xs text-slate-400 mb-1">{court.neighborhood}</p>
          )}

          <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
            <MapPin size={12} />
            <span>{BOROUGH_LABELS[court.borough] ?? court.borough}</span>
            {court.distance_miles !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatDistance(court.distance_miles)}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {court.avg_rating > 0 && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="font-medium">{court.avg_rating.toFixed(1)}</span>
                  <span className="text-slate-400">({court.review_count})</span>
                </div>
              )}
              {court.latest_crowd && (
                <CrowdBadge level={court.latest_crowd.crowd_level} size="sm" />
              )}
            </div>

            <div className="text-right">
              {court.is_bookable && court.hourly_rate ? (
                <div className="flex items-center gap-1 text-[#FF6B2C] font-bold text-sm">
                  <Zap size={12} />
                  {formatPrice(court.hourly_rate)}/hr
                </div>
              ) : (
                <span className="text-green-600 font-semibold text-sm">Free</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
