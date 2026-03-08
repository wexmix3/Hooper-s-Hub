'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Court, CourtFilters } from '@/types'
import { haversineDistance } from '@/lib/utils'

export function useCourts(filters: CourtFilters, userCoords?: { lat: number; lng: number } | null) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Date+time availability filter: only show courts with an open slot at the chosen hour
      if (filters.bookable && filters.availableDate && filters.availableHour !== undefined) {
        const startTime = `${String(filters.availableHour).padStart(2, '0')}:00:00`
        const { data: slots, error: slotErr } = await supabase
          .from('time_slots')
          .select('court_id')
          .eq('date', filters.availableDate)
          .eq('start_time', startTime)
          .eq('status', 'available')
        if (slotErr) throw slotErr

        const courtIds = Array.from(new Set((slots ?? []).map((s: { court_id: string }) => s.court_id)))
        if (courtIds.length === 0) {
          setCourts([])
          setLoading(false)
          return
        }

        let q = supabase.from('courts').select('*').in('id', courtIds).order('name')
        if (filters.borough !== 'all') q = q.eq('borough', filters.borough)
        if (filters.indoor !== null && filters.indoor !== undefined) q = q.eq('indoor', filters.indoor)
        const { data, error: courtErr } = await q
        if (courtErr) throw courtErr

        let result = (data as Court[]) ?? []
        if (userCoords) {
          result = result
            .map((c) => ({ ...c, distance_miles: haversineDistance(userCoords.lat, userCoords.lng, c.lat, c.lng) }))
            .sort((a, b) => (a.distance_miles ?? 999) - (b.distance_miles ?? 999))
        }
        setCourts(result)
        setLoading(false)
        return
      }

      let query = supabase
        .from('courts')
        .select('*')
        .order('name')

      if (filters.borough !== 'all') {
        query = query.eq('borough', filters.borough)
      }
      if (filters.indoor !== null && filters.indoor !== undefined) {
        query = query.eq('indoor', filters.indoor)
      }
      if (filters.bookable) {
        query = query.eq('is_bookable', true)
      }

      const { data, error: err } = await query
      if (err) throw err

      let result = (data as Court[]) ?? []

      // Compute distances and sort
      if (userCoords) {
        result = result
          .map((c) => ({
            ...c,
            distance_miles: haversineDistance(userCoords.lat, userCoords.lng, c.lat, c.lng),
          }))
          .sort((a, b) => (a.distance_miles ?? 999) - (b.distance_miles ?? 999))
      }

      setCourts(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courts')
    } finally {
      setLoading(false)
    }
  }, [filters.borough, filters.indoor, filters.bookable, filters.availableDate, filters.availableHour, userCoords?.lat, userCoords?.lng])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  return { courts, loading, error, refetch: fetchCourts }
}

export function useCourt(id: string) {
  const [court, setCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('courts')
        .select('*')
        .eq('id', id)
        .single()

      if (err) setError(err.message)
      else setCourt(data as Court)
      setLoading(false)
    }
    fetch()
  }, [id])

  return { court, loading, error }
}
