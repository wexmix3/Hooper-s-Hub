'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CourtCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('courts')
      .select('*', { count: 'exact', head: true })
      .then(({ count: n }) => { if (n !== null) setCount(n) })
  }, [])

  if (count === null) return <span>courts across all 5 boroughs</span>
  return <span>{count} courts across all 5 boroughs</span>
}
