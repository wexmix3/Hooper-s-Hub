'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { REVIEW_TAGS } from '@/types'

interface ReviewFormProps {
  courtId: string
  onSuccess?: () => void
}

export function ReviewForm({ courtId, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: err } = await supabase.from('reviews').upsert({
      court_id: courtId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
      tags: selectedTags,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    onSuccess?.()
    router.back()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Star rating */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Overall Rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform duration-100 hover:scale-110 active:scale-95"
            >
              <Star
                size={36}
                className={
                  star <= (hoveredRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Court Tags (optional)</p>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                selectedTags.includes(tag.id)
                  ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience at this court…"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] resize-none"
        />
        <p className="text-right text-xs text-slate-400 mt-1">{comment.length}/500</p>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Submit Review
      </Button>
    </form>
  )
}
