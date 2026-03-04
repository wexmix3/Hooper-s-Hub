import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Run } from '@/types'
import { formatDate, formatTime, SKILL_LABELS, BOROUGH_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RunCardProps {
  run: Run
}

const SKILL_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
  any: 'default',
}

export function RunCard({ run }: RunCardProps) {
  const spotsLeft = run.spots_total - run.spots_filled
  const isFull = run.status === 'full'

  return (
    <Link href={`/runs/${run.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition-shadow duration-200 group-hover:shadow-md active:scale-[0.99]">
        <div className="flex items-start gap-3">
          {/* Organizer avatar */}
          <div className="flex-shrink-0">
            {run.organizer?.avatar_url ? (
              <Image
                src={run.organizer.avatar_url}
                alt={run.organizer.display_name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FF6B2C] flex items-center justify-center text-white font-bold">
                {run.organizer?.display_name?.[0] ?? '?'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight">{run.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{run.organizer?.display_name}</p>
          </div>

          {/* Skill badge */}
          <Badge variant={SKILL_COLORS[run.skill_level]}>
            {SKILL_LABELS[run.skill_level]}
          </Badge>
        </div>

        <div className="mt-3 space-y-1.5">
          {/* Court */}
          {run.court && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin size={13} className="text-slate-400" />
              <span className="truncate">{run.court.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 flex-shrink-0">
                {BOROUGH_LABELS[run.court.borough] ?? run.court.borough}
              </span>
            </div>
          )}
          {/* Date/time */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock size={13} className="text-slate-400" />
            <span>{formatDate(run.date)}</span>
            <span className="text-slate-300">·</span>
            <span>{formatTime(run.start_time)}</span>
            {run.end_time && <><span className="text-slate-300">–</span><span>{formatTime(run.end_time)}</span></>}
          </div>
        </div>

        {/* Spots */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: run.spots_total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-4 h-4 rounded-full border',
                    i < run.spots_filled
                      ? 'bg-[#1B3A5C] border-[#1B3A5C]'
                      : 'border-slate-300'
                  )}
                />
              ))}
            </div>
          </div>
          <span className={cn('text-sm font-semibold', isFull ? 'text-red-500' : 'text-green-600')}>
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
      </div>
    </Link>
  )
}
