'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { CourtCard } from '@/components/courts/CourtCard'
import { CourtCardSkeleton } from '@/components/ui/Skeleton'
import { useCourts } from '@/hooks/useCourts'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { CourtFilters, Borough } from '@/types'
import { BOROUGH_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

const BOROUGHS: Array<{ value: Borough | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'Bronx' },
  { value: 'staten_island', label: 'S. Island' },
]

export default function BrowsePage() {
  const { coords } = useGeolocation()
  const [filters, setFilters] = useState<CourtFilters>({ borough: 'all', indoor: null, bookable: null })
  const [query, setQuery] = useState('')
  const { courts, loading, error } = useCourts(filters, coords)

  const filtered = query
    ? courts.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.address.toLowerCase().includes(query.toLowerCase())
      )
    : courts

  function chip(active: boolean) {
    return cn(
      'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
      active
        ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
        : 'bg-white text-slate-600 border-slate-200'
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 space-y-3">
        <h1 className="text-xl font-bold text-slate-900">Browse Courts</h1>
        <Input
          placeholder="Search by name or address…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={16} />}
        />
        {/* Borough chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {BOROUGHS.map((b) => (
            <button
              key={b.value}
              className={chip(filters.borough === b.value)}
              onClick={() => setFilters((f) => ({ ...f, borough: b.value }))}
            >
              {b.label}
            </button>
          ))}
          <div className="w-px h-8 bg-slate-200 self-center flex-shrink-0" />
          <button
            className={chip(filters.indoor === true)}
            onClick={() => setFilters((f) => ({ ...f, indoor: f.indoor === true ? null : true }))}
          >
            Indoor
          </button>
          <button
            className={chip(filters.indoor === false)}
            onClick={() => setFilters((f) => ({ ...f, indoor: f.indoor === false ? null : false }))}
          >
            Outdoor
          </button>
          <button
            className={chip(!!filters.bookable)}
            onClick={() => setFilters((f) => ({ ...f, bookable: f.bookable ? null : true }))}
          >
            Bookable
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <p className="text-center text-red-500 py-8">{error}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourtCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏀</p>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No courts found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3 font-medium">
              {filtered.length} court{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
