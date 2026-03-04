'use client'

import { cn } from '@/lib/utils'
import type { CourtFilters, Borough } from '@/types'
import { BOROUGH_LABELS } from '@/lib/utils'

interface FilterChipsProps {
  filters: CourtFilters
  onChange: (filters: CourtFilters) => void
}

const BOROUGHS: Array<{ value: Borough | 'all'; label: string }> = [
  { value: 'all', label: 'All NYC' },
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'The Bronx' },
  { value: 'staten_island', label: 'Staten Island' },
]

export function FilterChips({ filters, onChange }: FilterChipsProps) {
  function chip(active: boolean) {
    return cn(
      'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
      active
        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
    )
  }

  return (
    <div className="absolute top-2 left-0 right-0 z-20 px-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* Borough filters */}
        {BOROUGHS.map((b) => (
          <button
            key={b.value}
            className={chip(filters.borough === b.value)}
            onClick={() => onChange({ ...filters, borough: b.value })}
          >
            {b.label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 self-center flex-shrink-0" />

        {/* Indoor toggle */}
        <button
          className={chip(filters.indoor === true)}
          onClick={() =>
            onChange({ ...filters, indoor: filters.indoor === true ? null : true })
          }
        >
          Indoor
        </button>
        <button
          className={chip(filters.indoor === false)}
          onClick={() =>
            onChange({ ...filters, indoor: filters.indoor === false ? null : false })
          }
        >
          Outdoor
        </button>

        {/* Bookable toggle */}
        <button
          className={chip(!!filters.bookable)}
          onClick={() => onChange({ ...filters, bookable: filters.bookable ? null : true })}
        >
          Bookable
        </button>
      </div>
    </div>
  )
}
