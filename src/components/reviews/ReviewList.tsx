'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'
import { timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { REVIEW_TAGS } from '@/types'

interface ReviewListProps {
  courtId: string
}

export function ReviewList({ courtId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from('reviews')
        .select('*, profile:profiles(display_name, avatar_url)')
        .eq('court_id', courtId)
        .order('created_at', { ascending: false })
        .limit(20)

      setReviews((data as Review[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [courtId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-2">⭐</p>
        <p className="text-slate-500 text-sm">No reviews yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.profile?.avatar_url ? (
              <Image
                src={review.profile.avatar_url}
                alt={review.profile.display_name}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-sm font-bold">
                {review.profile?.display_name?.[0] ?? '?'}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-sm text-slate-900">
                {review.profile?.display_name ?? 'Anonymous'}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(review.created_at)}</span>
            </div>
            {/* Stars */}
            <div className="flex gap-0.5 mt-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                />
              ))}
            </div>
            {review.comment && (
              <p className="text-sm text-slate-700 mb-2">{review.comment}</p>
            )}
            {/* Tags */}
            {review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {review.tags.map((tag) => {
                  const tagDef = REVIEW_TAGS.find((t) => t.id === tag)
                  return (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tagDef?.label ?? tag}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
