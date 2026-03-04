'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { TimeSlot, Court } from '@/types'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BookPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get('slot')

  const [court, setCourt] = useState<Court | null>(null)
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slotId) {
      router.replace(`/courts/${id}`)
      return
    }

    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('courts').select('*').eq('id', id).single(),
        supabase.from('time_slots').select('*').eq('id', slotId!).single(),
      ])

      setCourt(c as Court)
      setSlot(s as TimeSlot)
      setLoading(false)
    }
    load()
  }, [id, slotId, router])

  async function handleCheckout() {
    if (!slot) return
    setCheckoutLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id, courtId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!court || !slot) return null

  const platformFee = Math.round(slot.price * 0.08)
  const total = slot.price + platformFee

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href={`/courts/${id}`} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Confirm Booking</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Court card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">{court.name}</h2>
          <p className="text-sm text-slate-500">{court.address}</p>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900">Booking Details</h3>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Calendar size={16} className="text-[#1B3A5C]" />
            <span>{formatDate(slot.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Clock size={16} className="text-[#1B3A5C]" />
            <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900">Price</h3>
          <div className="flex justify-between text-sm text-slate-700">
            <span>Court fee (1 hr)</span>
            <span>{formatPrice(slot.price)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Platform fee (8%)</span>
            <span>{formatPrice(platformFee)}</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span className="text-[#FF6B2C]">{formatPrice(total)}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <Button className="w-full" size="lg" onClick={handleCheckout} loading={checkoutLoading}>
          <DollarSign size={18} />
          Pay {formatPrice(total)} — Confirm Booking
        </Button>

        <p className="text-center text-xs text-slate-400">
          Secure payment via Stripe. You can cancel up to 24 hours before for a full refund.
        </p>
      </div>
    </div>
  )
}
