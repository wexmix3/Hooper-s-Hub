'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LiveBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    supabase
      .from('crowd_reports')
      .select('id', { count: 'exact', head: true })
      .gte('reported_at', cutoff)
      .then(({ count: c }) => {
        if (c !== null) setCount(c)
      })
  }, [])

  if (count === null || count === 0) return null

  return (
    <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 text-sm font-semibold border border-white/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      {count} {count === 1 ? 'court' : 'courts'} active right now
    </div>
  )
}
