'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Calendar, ChevronRight, Edit2, MapPin, BarChart3, Clock, Users, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Court, Run } from '@/types'
import { BOROUGH_LABELS, formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const POSITION_LABELS: Record<string, string> = {
  point_guard: 'Point Guard', shooting_guard: 'Shooting Guard',
  small_forward: 'Small Forward', power_forward: 'Power Forward',
  center: 'Center', any: 'Any Position',
}
const POSITION_SHORT: Record<string, string> = {
  point_guard: 'PG', shooting_guard: 'SG', small_forward: 'SF',
  power_forward: 'PF', center: 'C', any: 'Any',
}
const PLAY_STYLE_LABELS: Record<string, string> = {
  competitive: 'Competitive', casual: 'Casual', both: 'Both',
}
const SKILL_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-orange-100 text-orange-700',
  any: 'bg-slate-100 text-slate-600',
}

function avatarColor(name: string) {
  const colors = ['#FF6B2C', '#1B3A5C', '#7C3AED', '#059669', '#DC2626', '#D97706']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % colors.length
  return colors[hash]
}

type TabKey = 'runs' | 'saved' | 'settings'

interface JoinedRun {
  id: string
  title: string
  date: string
  start_time: string
  skill_level: string
  spots_filled: number
  spots_total: number
  status: string
  court: { name: string; borough: string } | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [savedCourts, setSavedCourts] = useState<Court[]>([])
  const [joinedRuns, setJoinedRuns] = useState<JoinedRun[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('runs')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, savedRes, runsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase
          .from('saved_courts')
          .select('court:courts(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('run_participants')
          .select('run:runs(id, title, date, start_time, skill_level, spots_filled, spots_total, status, court:courts(name, borough))')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(20),
      ])

      if (profileRes.data) setProfile(profileRes.data as Profile)

      if (savedRes.data) {
        setSavedCourts(
          savedRes.data
            .map((s: { court: Court | Court[] }) => (Array.isArray(s.court) ? s.court[0] : s.court))
            .filter(Boolean)
        )
      }

      if (runsRes.data) {
        setJoinedRuns(
          runsRes.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => (Array.isArray(p.run) ? p.run[0] : p.run))
            .filter(Boolean)
        )
      }

      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const name = profile?.display_name ?? 'Hooper'
  const color = avatarColor(name)
  const hasPlayerCard = profile?.skill_level || profile?.position || profile?.play_style

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="bg-[#1B3A5C] px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={name}
              width={72}
              height={72}
              className="rounded-full object-cover border-2 border-white/30"
              unoptimized
            />
          ) : (
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{name}</h1>
            {profile?.bio && (
              <p className="text-blue-200 text-sm mt-0.5 line-clamp-2">{profile.bio}</p>
            )}
            {profile?.borough && (
              <p className="text-blue-300 text-xs mt-1 flex items-center gap-1">
                <MapPin size={10} />
                {BOROUGH_LABELS[profile.borough] ?? profile.borough}
              </p>
            )}
          </div>
          <Link
            href="/profile/edit"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <Edit2 size={18} />
          </Link>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Player Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          {hasPlayerCard ? (
            <div className="flex flex-wrap gap-2 items-center">
              {profile?.skill_level && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SKILL_COLORS[profile.skill_level]}`}>
                  {profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)}
                </span>
              )}
              {profile?.position && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {POSITION_SHORT[profile.position] ?? profile.position}
                </span>
              )}
              {profile?.play_style && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {PLAY_STYLE_LABELS[profile.play_style] ?? profile.play_style}
                </span>
              )}
            </div>
          ) : (
            <Link href="/profile/edit" className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Complete your player profile</p>
                <p className="text-xs text-slate-400 mt-0.5">Add your position, play style, and preferences</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Runs Joined', value: profile?.runs_joined ?? joinedRuns.length },
            { label: 'Runs Organized', value: profile?.runs_organized ?? 0 },
            { label: 'Member Since', value: memberSince },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['runs', 'saved', 'settings'] as TabKey[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-[#FF6B2C] border-b-2 border-[#FF6B2C]'
                    : 'text-slate-500'
                }`}
              >
                {t === 'runs' ? 'My Runs' : t === 'saved' ? 'Saved' : 'Settings'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* My Runs Tab */}
            {tab === 'runs' && (
              joinedRuns.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No runs yet</p>
                  <p className="text-slate-400 text-xs mt-1 mb-3">Join a pickup game to build your history.</p>
                  <Link href="/runs" className="text-[#FF6B2C] text-sm font-semibold hover:underline">
                    Browse upcoming runs →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinedRuns.map((run) => (
                    <Link
                      key={run.id}
                      href={`/runs/${run.id}`}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{run.title}</p>
                        {run.court && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {run.court.name} · {BOROUGH_LABELS[run.court.borough] ?? run.court.borough}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {formatDate(run.date)} · {formatTime(run.start_time)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={
                          run.skill_level === 'beginner' ? 'success' :
                          run.skill_level === 'intermediate' ? 'warning' :
                          run.skill_level === 'advanced' ? 'danger' : 'default'
                        }>
                          {run.skill_level}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-1">{run.spots_filled}/{run.spots_total} spots</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Saved Courts Tab */}
            {tab === 'saved' && (
              savedCourts.length === 0 ? (
                <div className="text-center py-8">
                  <Star size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No saved courts</p>
                  <p className="text-slate-400 text-xs mt-1 mb-3">Heart a court to save it for quick access.</p>
                  <Link href="/browse" className="text-[#FF6B2C] text-sm font-semibold hover:underline">
                    Browse courts →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedCourts.map((court) => (
                    <Link
                      key={court.id}
                      href={`/courts/${court.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      {court.photos?.[0] ? (
                        <Image
                          src={court.photos[0]}
                          alt={court.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <MapPin size={16} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{court.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {BOROUGH_LABELS[court.borough] ?? court.borough}
                          {court.neighborhood ? ` · ${court.neighborhood}` : ''}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div className="space-y-2">
                <Link
                  href="/profile/bookings"
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <Calendar size={18} className="text-[#1B3A5C]" />
                  <span className="flex-1 font-medium text-slate-900 text-sm">My Bookings</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>

                {profile?.is_venue_owner && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <BarChart3 size={18} className="text-[#1B3A5C]" />
                    <span className="flex-1 font-medium text-slate-900 text-sm">Venue Dashboard</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>
                )}

                <Link
                  href="/forgot-password"
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <span className="w-[18px] h-[18px] flex items-center justify-center text-[#1B3A5C]">🔒</span>
                  <span className="flex-1 font-medium text-slate-900 text-sm">Change Password</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 w-full text-left hover:border-red-100 transition-colors"
                >
                  <LogOut size={18} className="text-red-500" />
                  <span className="flex-1 font-medium text-red-500 text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom padding for nav */}
      <div className="h-6" />
    </div>
  )
}
