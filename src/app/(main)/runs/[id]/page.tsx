'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Clock, Users, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRun } from '@/hooks/useRuns'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RunChat } from '@/components/runs/RunChat'
import { formatDate, formatTime, SKILL_LABELS, BOROUGH_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RunDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { run, loading, error, refetch } = useRun(id)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !run) {
    return <p className="text-center text-red-500 py-16">Run not found</p>
  }

  const isOrganizer = currentUserId === run.organizer_id
  const isParticipant = run.participants?.some((p) => p.user_id === currentUserId)
  const isFull = run.status === 'full'
  const spotsLeft = run.spots_total - run.spots_filled

  async function handleJoin() {
    if (!currentUserId) { router.push('/login'); return }
    setJoining(true)
    const supabase = createClient()
    await supabase.from('run_participants').insert({ run_id: id, user_id: currentUserId })
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50])
    await refetch()
    setJoining(false)
  }

  async function handleLeave() {
    if (!currentUserId || isOrganizer) return
    setLeaving(true)
    const supabase = createClient()
    await supabase
      .from('run_participants')
      .delete()
      .eq('run_id', id)
      .eq('user_id', currentUserId)
    await refetch()
    setLeaving(false)
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href="/runs" className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900 flex-1 truncate">{run.title}</h1>
        <Badge
          variant={
            run.skill_level === 'beginner' ? 'success' :
            run.skill_level === 'intermediate' ? 'warning' :
            run.skill_level === 'advanced' ? 'danger' : 'default'
          }
        >
          {SKILL_LABELS[run.skill_level]}
        </Badge>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Court info */}
        {run.court && (
          <Link
            href={`/courts/${run.court.id}`}
            className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 bg-[#1B3A5C] rounded-xl flex items-center justify-center text-white">
              🏀
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{run.court.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={10} />
                {run.court.address}
              </p>
            </div>
          </Link>
        )}

        {/* Date/time */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 text-slate-700">
            <Clock size={18} className="text-[#1B3A5C]" />
            <div>
              <p className="font-semibold">{formatDate(run.date)}</p>
              <p className="text-sm text-slate-500">
                {formatTime(run.start_time)}
                {run.end_time && ` – ${formatTime(run.end_time)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {run.description && (
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed">{run.description}</p>
          </div>
        )}

        {/* Spots + participants */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Users size={18} className="text-[#1B3A5C]" />
              Players ({run.spots_filled}/{run.spots_total})
            </div>
            <span className={cn('text-sm font-semibold', isFull ? 'text-red-500' : 'text-green-600')}>
              {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>

          {/* Participant avatars */}
          <div className="flex flex-wrap gap-2">
            {run.participants?.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                {p.profile?.avatar_url ? (
                  <Image
                    src={p.profile.avatar_url}
                    alt={p.profile.display_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1B3A5C] flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm">
                    {p.profile?.display_name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-[9px] text-slate-400 max-w-[40px] truncate">
                  {p.profile?.display_name}
                </span>
              </div>
            ))}
            {/* Empty spots */}
            {Array.from({ length: spotsLeft }).map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-lg"
              >
                +
              </div>
            ))}
          </div>

          {/* Join/Leave CTA */}
          {!isOrganizer && (
            <div className="mt-4">
              {isParticipant ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLeave}
                  loading={leaving}
                >
                  Leave Run
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleJoin}
                  disabled={isFull}
                  loading={joining}
                >
                  {isFull ? 'Run is Full' : "I'm In! 🏀"}
                </Button>
              )}
            </div>
          )}
          {isOrganizer && (
            <p className="text-xs text-slate-400 text-center mt-3">You organized this run</p>
          )}
        </div>

        {/* Chat */}
        {currentUserId && (isParticipant || isOrganizer) && (
          <div className="bg-white rounded-xl border border-slate-100 pb-4">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <MessageCircle size={18} className="text-[#1B3A5C]" />
              <h2 className="font-bold text-slate-900">Group Chat</h2>
            </div>
            <div className="pt-3">
              <RunChat runId={id} currentUserId={currentUserId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
