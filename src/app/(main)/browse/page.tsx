'use client'

import { useState } from 'react'
import { Search, Calendar, Clock, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { CourtCard } from '@/components/courts/CourtCard'
import { CourtCardSkeleton } from '@/components/ui/Skeleton'
import { useCourts } from '@/hooks/useCourts'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { CourtFilters, Borough } from '@/types'
import { cn } from '@/lib/utils'

const BOROUGHS: Array<{ value: Borough | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'Bronx' },
  { value: 'staten_island', label: 'S. Island' },
]

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6
  const label = h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`
  return { value: h, label }
})

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function BrowsePage() {
  const { coords } = useGeolocation()
  const [filters, setFilters] = useState<CourtFilters>({ borough: 'all', indoor: null, bookable: null })
  const [query, setQuery] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
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

  function toggleBookable() {
    if (filters.bookable) {
      setFilters((f) => ({ ...f, bookable: null, availableDate: undefined, availableHour: undefined }))
      setShowDatePicker(false)
    } else {
      setFilters((f) => ({ ...f, bookable: true }))
    }
  }

  function clearDateFilter() {
    setFilters((f) => ({ ...f, availableDate: undefined, availableHour: undefined }))
    setShowDatePicker(false)
  }

  const hasDateFilter = !!(filters.availableDate && filters.availableHour !== undefined)

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
        {/* Borough + filter chips */}
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
          <button className={chip(!!filters.bookable)} onClick={toggleBookable}>
            Bookable
          </button>
        </div>

        {/* Date/time availability — only shown when Bookable is on */}
        {filters.bookable && (
          <div className="space-y-2">
            {!showDatePicker && !hasDateFilter && (
              <button
                onClick={() => setShowDatePicker(true)}
                className="flex items-center gap-2 text-sm text-[#FF6B2C] font-medium"
              >
                <Calendar size={15} />
                Find availability on a specific date
              </button>
            )}

            {showDatePicker && !hasDateFilter && (
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <input
                    type="date"
                    min={todayStr()}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20"
                    onChange={(e) => setFilters((f) => ({ ...f, availableDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <select
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20"
                    onChange={(e) => setFilters((f) => ({ ...f, availableHour: Number(e.target.value) }))}
                    defaultValue=""
                  >
                    <option value="" disabled>Pick time</option>
                    {HOURS.map((h) => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            )}

            {hasDateFilter && (
              <div className="flex items-center gap-2 bg-[#1B3A5C]/5 border border-[#1B3A5C]/20 rounded-xl px-3 py-2">
                <Calendar size={14} className="text-[#1B3A5C]" />
                <span className="text-sm text-[#1B3A5C] font-medium flex-1">
                  {new Date(filters.availableDate! + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}
                  {HOURS.find((h) => h.value === filters.availableHour)?.label}
                </span>
                <button onClick={clearDateFilter} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourtCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏀</p>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {hasDateFilter ? 'No courts available at that time' : 'No courts found'}
            </h3>
            <p className="text-slate-500 text-sm">
              {hasDateFilter ? 'Try a different date or time' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3 font-medium">
              {filtered.length} court{filtered.length !== 1 ? 's' : ''} found
              {hasDateFilter && ' with open slots'}
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
