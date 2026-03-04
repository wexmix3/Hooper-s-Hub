'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { CrowdLevel } from '@/types'
import { CROWD_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

interface CrowdReportFormProps {
  courtId: string
  onSuccess?: () => void
}

const CROWD_OPTIONS: CrowdLevel[] = ['empty', 'few_people', 'half_full', 'packed']

const CROWD_ICONS: Record<CrowdLevel, string> = {
  empty: '🏀',
  few_people: '👥',
  half_full: '🏃',
  packed: '🔥',
}

const CROWD_DESCRIPTIONS: Record<CrowdLevel, string> = {
  empty: 'No one here — all courts open',
  few_people: '1–4 people, plenty of room',
  half_full: 'Active but space available',
  packed: 'No room, long wait expected',
}

export function CrowdReportForm({ courtId, onSuccess }: CrowdReportFormProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<CrowdLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: err } = await supabase.from('crowd_reports').insert({
      court_id: courtId,
      user_id: user.id,
      crowd_level: selected,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(50)

    onSuccess?.()
    router.back()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        How busy is the court right now? Your report helps other players plan their visit.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-3">
        {CROWD_OPTIONS.map((level) => {
          const config = CROWD_CONFIG[level]
          const isSelected = selected === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => setSelected(level)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200',
                isSelected
                  ? 'border-[#1B3A5C] bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <span className="text-3xl">{CROWD_ICONS[level]}</span>
              <div className="flex-1">
                <p className={cn('font-bold text-base', config.color)}>{config.label}</p>
                <p className="text-slate-500 text-sm">{CROWD_DESCRIPTIONS[level]}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  isSelected ? 'border-[#1B3A5C] bg-[#1B3A5C]' : 'border-slate-300'
                )}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          )
        })}
      </div>

      <Button
        className="w-full mt-4"
        disabled={!selected}
        loading={loading}
        onClick={handleSubmit}
      >
        Report Crowd Level
      </Button>
    </div>
  )
}
