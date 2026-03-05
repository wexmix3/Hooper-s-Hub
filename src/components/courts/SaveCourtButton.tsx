'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface SaveCourtButtonProps {
  courtId: string
  className?: string
}

export function SaveCourtButton({ courtId, className }: SaveCourtButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    async function checkSaved() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('saved_courts')
        .select('id')
        .eq('user_id', user.id)
        .eq('court_id', courtId)
        .single()
      setSaved(!!data)
      setLoading(false)
    }
    checkSaved()
  }, [courtId])

  async function toggle() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)

    if (saved) {
      await supabase
        .from('saved_courts')
        .delete()
        .eq('user_id', user.id)
        .eq('court_id', courtId)
      setSaved(false)
    } else {
      await supabase
        .from('saved_courts')
        .insert({ user_id: user.id, court_id: courtId })
      setSaved(true)
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2.5 rounded-xl transition-all duration-200 border',
        saved
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-slate-200 text-slate-400 hover:text-red-400 hover:border-red-200',
        animating && 'scale-125',
        className
      )}
      aria-label={saved ? 'Unsave court' : 'Save court'}
    >
      <Heart
        size={18}
        className={cn('transition-all', saved && 'fill-red-500')}
      />
    </button>
  )
}
