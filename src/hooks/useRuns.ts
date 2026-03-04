'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Run, RunFilters } from '@/types'

export function useRuns(filters: RunFilters) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRuns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('runs')
        .select(`
          *,
          court:courts(id, name, borough, address, lat, lng),
          organizer:profiles!runs_organizer_id_fkey(display_name, avatar_url)
        `)
        .in('status', ['open', 'full'])
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (filters.borough !== 'all') {
        query = query.eq('courts.borough', filters.borough)
      }
      if (filters.skill_level !== 'all') {
        query = query.in('skill_level', [filters.skill_level, 'any'])
      }
      if (filters.date) {
        query = query.eq('date', filters.date)
      }

      const { data, error: err } = await query
      if (err) throw err

      setRuns((data as Run[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runs')
    } finally {
      setLoading(false)
    }
  }, [filters.borough, filters.skill_level, filters.date])

  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  return { runs, loading, error, refetch: fetchRuns }
}

export function useRun(id: string) {
  const [run, setRun] = useState<Run | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRun = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('runs')
      .select(`
        *,
        court:courts(id, name, borough, address, lat, lng, indoor),
        organizer:profiles!runs_organizer_id_fkey(display_name, avatar_url),
        participants:run_participants(
          id, user_id, joined_at,
          profile:profiles(display_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (err) setError(err.message)
    else setRun(data as Run)
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchRun()
  }, [fetchRun])

  return { run, loading, error, refetch: fetchRun }
}
