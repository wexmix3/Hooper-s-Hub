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
  }, [filters.borough, filters.indoor, filters.bookable, userCoords?.lat, userCoords?.lng])

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
