'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TimeSlot, Booking } from '@/types'

export function useTimeSlots(courtId: string, date: string) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!date) return
    const supabase = createClient()

    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from('time_slots')
        .select('*')
        .eq('court_id', courtId)
        .eq('date', date)
        .in('status', ['available', 'booked', 'held'])
        .order('start_time')

      setSlots((data as TimeSlot[]) ?? [])
      setLoading(false)
    }

    fetch()

    // Subscribe to slot status changes for this court/date
    const channel = supabase
      .channel(`slots:${courtId}:${date}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'time_slots',
          filter: `court_id=eq.${courtId}`,
        },
        () => fetch()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [courtId, date])

  return { slots, loading }
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts(id, name, address, borough, photos),
          slot:time_slots(date, start_time, end_time)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) setError(err.message)
      else setBookings((data as Booking[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { bookings, loading, error }
}
