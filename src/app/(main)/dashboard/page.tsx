'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, DollarSign, Calendar, TrendingUp, Zap, CheckCircle2, AlertCircle, Building2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, formatTime } from '@/lib/utils'
import type { Court, Booking } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  monthRevenue: number
  monthBookings: number
  avgBookingValue: number
  totalRevenue: number
}

interface RevenueDay {
  date: string
  amount: number
}

interface VenueProfile {
  is_venue_owner: boolean
  stripe_connected: boolean
  stripe_account_id: string | null
  display_name: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<VenueProfile | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [recentBookings, setRecentBookings] = useState<(Booking & { court?: Court; slot?: { date: string; start_time: string; end_time: string; price: number } })[]>([])
  const [stats, setStats] = useState<DashboardStats>({ monthRevenue: 0, monthBookings: 0, avgBookingValue: 0, totalRevenue: 0 })
  const [revenueChart, setRevenueChart] = useState<RevenueDay[]>([])
  const [loading, setLoading] = useState(true)
  const [connectLoading, setConnectLoading] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<string | null>(null)

  useEffect(() => {
    // Check for Stripe callback status
    const urlParams = new URLSearchParams(window.location.search)
    const stripeParam = urlParams.get('stripe')
    if (stripeParam) {
      setStripeStatus(stripeParam)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Load profile
      const { data: p } = await supabase
        .from('profiles')
        .select('is_venue_owner, stripe_connected, stripe_account_id, display_name')
        .eq('user_id', user.id)
        .single()

      if (!p?.is_venue_owner) { router.push('/map'); return }
      setProfile(p)

      // Load courts owned by this user
      const { data: myCourts } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      setCourts((myCourts as Court[]) ?? [])

      const courtIds = (myCourts ?? []).map((c: Court) => c.id)
      if (courtIds.length === 0) { setLoading(false); return }

      // Load bookings
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, court:courts(name, address), slot:time_slots(date, start_time, end_time, price)')
        .in('court_id', courtIds)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(50)

      const allBookings = (bookings ?? []) as typeof recentBookings
      setRecentBookings(allBookings.slice(0, 10))

      // Stats
      const monthBookings = allBookings.filter((b) => b.created_at >= monthStart)
      const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.amount - (b.platform_fee ?? 0)), 0)
      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amount - (b.platform_fee ?? 0)), 0)

      setStats({
        monthRevenue,
        monthBookings: monthBookings.length,
        avgBookingValue: monthBookings.length > 0 ? Math.round(monthRevenue / monthBookings.length) : 0,
        totalRevenue,
      })

      // Build 30-day revenue chart
      const chart: RevenueDay[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayBookings = allBookings.filter((b) => b.created_at?.startsWith(dateStr))
        const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.amount - (b.platform_fee ?? 0)), 0)
        chart.push({ date: dateStr.slice(5), amount: Math.round(dayRevenue / 100) }) // dollars
      }
      setRevenueChart(chart)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleConnectStripe() {
    setConnectLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setConnectLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-[#1B3A5C] text-white px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 size={20} className="text-blue-300" />
          <h1 className="font-display text-xl font-bold">Venue Dashboard</h1>
        </div>
        <p className="text-blue-200 text-sm">Welcome back, {profile?.display_name}</p>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stripe connect banner */}
        {!profile?.stripe_connected && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 text-sm">Connect Stripe to receive payments</p>
              <p className="text-amber-700 text-xs mt-0.5">Bookings are paused until you complete Stripe setup.</p>
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={connectLoading}
              className="flex-shrink-0 bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {connectLoading ? 'Loading…' : 'Connect'}
            </button>
          </div>
        )}

        {stripeStatus === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm font-semibold">Stripe connected! You can now receive payments.</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'This Month', value: formatPrice(stats.monthRevenue), icon: <DollarSign size={16} className="text-[#FF6B2C]" /> },
            { label: 'Bookings (MTD)', value: stats.monthBookings.toString(), icon: <Calendar size={16} className="text-[#FF6B2C]" /> },
            { label: 'Avg Booking', value: formatPrice(stats.avgBookingValue), icon: <TrendingUp size={16} className="text-[#FF6B2C]" /> },
            { label: 'Total Earned', value: formatPrice(stats.totalRevenue), icon: <Zap size={16} className="text-[#FF6B2C]" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                {s.icon}
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="font-display text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        {revenueChart.some((d) => d.amount > 0) && (
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Revenue — Last 30 Days ($)</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="amount" fill="#FF6B2C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* My Courts */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">My Courts</h3>
            <Link href="/venue-signup" className="text-xs text-[#FF6B2C] font-semibold hover:underline">
              + Add court
            </Link>
          </div>
          {courts.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Building2 size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No courts listed yet.</p>
              <Link href="/venue-signup" className="text-[#FF6B2C] text-sm font-semibold hover:underline mt-1 block">
                List your first court →
              </Link>
            </div>
          ) : (
            courts.map((court) => (
              <div key={court.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{court.name}</p>
                  <p className="text-xs text-slate-400">{court.address}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${court.is_bookable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {court.is_bookable ? 'Live' : 'Paused'}
                </span>
                <Link href={`/courts/${court.id}`} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <ExternalLink size={14} className="text-slate-400" />
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Bookings</h3>
          </div>
          {recentBookings.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-slate-500 text-sm">No bookings yet. Share your court listing to get started.</p>
            </div>
          ) : (
            recentBookings.map((b) => {
              const court = Array.isArray(b.court) ? b.court[0] : b.court
              const slot = Array.isArray(b.slot) ? b.slot[0] : b.slot
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{court?.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(slot?.date)} · {formatTime(slot?.start_time)}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#FF6B2C]">
                    +{formatPrice((b.amount ?? 0) - (b.platform_fee ?? 0))}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
