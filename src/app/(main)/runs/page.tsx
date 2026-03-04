'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { RunCard } from '@/components/runs/RunCard'
import { RunCardSkeleton } from '@/components/ui/Skeleton'
import { useRuns } from '@/hooks/useRuns'
import type { RunFilters, Borough, SkillLevel } from '@/types'
import { cn } from '@/lib/utils'

const BOROUGHS: Array<{ value: Borough | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'Bronx' },
  { value: 'staten_island', label: 'S. Island' },
]

const SKILLS: Array<{ value: SkillLevel | 'all'; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function RunsPage() {
  const [filters, setFilters] = useState<RunFilters>({ borough: 'all', skill_level: 'all' })
  const { runs, loading, error } = useRuns(filters)

  function chip(active: boolean) {
    return cn(
      'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
      active
        ? 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
        : 'bg-white text-slate-600 border-slate-200'
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Pickup Runs</h1>
          <Link
            href="/runs/create"
            className="flex items-center gap-1.5 bg-[#FF6B2C] text-white text-sm font-semibold px-3 py-2 rounded-xl"
          >
            <Plus size={16} />
            Create Run
          </Link>
        </div>

        {/* Borough filter */}
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
        </div>

        {/* Skill filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SKILLS.map((s) => (
            <button
              key={s.value}
              className={chip(filters.skill_level === s.value)}
              onClick={() => setFilters((f) => ({ ...f, skill_level: s.value }))}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <RunCardSkeleton key={i} />)}
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏃</p>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No runs scheduled</h3>
            <p className="text-slate-500 text-sm mb-4">Be the first to organize a game!</p>
            <Link
              href="/runs/create"
              className="inline-flex items-center gap-2 bg-[#FF6B2C] text-white font-semibold px-5 py-2.5 rounded-xl"
            >
              <Plus size={16} />
              Create a Run
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => <RunCard key={run.id} run={run} />)}
          </div>
        )}
      </div>
    </div>
  )
}
