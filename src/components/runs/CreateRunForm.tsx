'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Court } from '@/types'
import { getNextDays, formatDate } from '@/lib/utils'

export function CreateRunForm() {
  const router = useRouter()
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const days = getNextDays(14)

  const [form, setForm] = useState({
    court_id: '',
    title: '',
    date: days[0],
    start_time: '10:00',
    end_time: '12:00',
    spots_total: '10',
    skill_level: 'any',
    description: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('courts')
      .select('id, name, borough')
      .order('name')
      .then(({ data }) => setCourts((data as Court[]) ?? []))
  }, [])

  const courtOptions = [
    { value: '', label: 'Select a court…' },
    ...courts.map((c) => ({ value: c.id, label: `${c.name} (${c.borough})` })),
  ]

  const skillOptions = [
    { value: 'any', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  const dateOptions = days.map((d) => ({ value: d, label: formatDate(d) }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.court_id) { setError('Please select a court'); return }
    if (parseInt(form.spots_total) < 2) { setError('Need at least 2 spots'); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: err } = await supabase
      .from('runs')
      .insert({
        court_id: form.court_id,
        organizer_id: user.id,
        title: form.title,
        date: form.date,
        start_time: form.start_time + ':00',
        end_time: form.end_time ? form.end_time + ':00' : null,
        spots_total: parseInt(form.spots_total),
        skill_level: form.skill_level,
        description: form.description.trim() || null,
        status: 'open',
      })
      .select('id')
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Also join as organizer
    await supabase.from('run_participants').insert({
      run_id: data.id,
      user_id: user.id,
    })

    router.push(`/runs/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <Input
        id="title"
        label="Run Name"
        placeholder="e.g. Saturday Morning Pickup"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        required
      />

      <Select
        id="court"
        label="Court"
        options={courtOptions}
        value={form.court_id}
        onChange={(e) => setForm((f) => ({ ...f, court_id: e.target.value }))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="date"
          label="Date"
          options={dateOptions}
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <Input
          id="start_time"
          type="time"
          label="Start Time"
          value={form.start_time}
          onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="end_time"
          type="time"
          label="End Time (optional)"
          value={form.end_time}
          onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
        />
        <Input
          id="spots"
          type="number"
          label="Total Spots"
          min="2"
          max="30"
          value={form.spots_total}
          onChange={(e) => setForm((f) => ({ ...f, spots_total: e.target.value }))}
          required
        />
      </div>

      <Select
        id="skill_level"
        label="Skill Level"
        options={skillOptions}
        value={form.skill_level}
        onChange={(e) => setForm((f) => ({ ...f, skill_level: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description (optional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Tell players what to expect…"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] resize-none"
        />
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Create Run
      </Button>
    </form>
  )
}
