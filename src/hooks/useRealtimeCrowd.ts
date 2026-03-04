'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CrowdReport } from '@/types'
import { isCrowdFresh } from '@/lib/utils'

export function useRealtimeCrowd(courtId: string) {
  const [latestReport, setLatestReport] = useState<CrowdReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Fetch latest report
    async function fetchLatest() {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('crowd_reports')
        .select('*, profile:profiles(display_name, avatar_url)')
        .eq('court_id', courtId)
        .gte('reported_at', twoHoursAgo)
        .order('reported_at', { ascending: false })
        .limit(1)
        .single()

      setLatestReport(data && isCrowdFresh(data.reported_at) ? (data as CrowdReport) : null)
      setLoading(false)
    }

    fetchLatest()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`crowd:${courtId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crowd_reports',
          filter: `court_id=eq.${courtId}`,
        },
        (payload) => {
          const report = payload.new as CrowdReport
          if (isCrowdFresh(report.reported_at)) {
            setLatestReport(report)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courtId])

  return { latestReport, loading }
}
