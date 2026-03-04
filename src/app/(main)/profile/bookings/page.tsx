'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useBookings } from '@/hooks/useBooking'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Booking } from '@/types'

function SuccessBanner() {
  const searchParams = useSearchParams()
  const success = searchParams.get('booking') === 'success'

  if (!success) return null

  return (
    <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-green-800">Booking confirmed!</p>
        <p className="text-sm text-green-600">Check your email for details.</p>
      </div>
    </div>
  )
}

export default function BookingsPage() {
  const { bookings, loading } = useBookings()
  const upcoming = bookings.filter((b) => b.status === 'confirmed')
  const past = bookings.filter((b) => b.status !== 'confirmed')

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href="/profile" className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">My Bookings</h1>
      </div>

      <Suspense>
        <SuccessBanner />
      </Suspense>

      <div className="px-4 py-5 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <>
            <section>
              <h2 className="font-bold text-slate-900 mb-3">Upcoming</h2>
              {upcoming.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-slate-500 text-sm">No upcoming bookings</p>
                  <Link href="/browse" className="text-[#FF6B2C] text-sm font-semibold mt-2 block">
                    Browse bookable courts →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <h2 className="font-bold text-slate-900 mb-3">Past</h2>
                <div className="space-y-3">
                  {past.map((b) => <BookingCard key={b.id} booking={b} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusConfig = {
    confirmed: { label: 'Confirmed', variant: 'success' as const },
    cancelled: { label: 'Cancelled', variant: 'danger' as const },
    completed: { label: 'Completed', variant: 'default' as const },
  }[booking.status] ?? { label: booking.status, variant: 'default' as const }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-slate-900">{booking.court?.name ?? 'Court'}</h3>
            {booking.court?.address && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} />{booking.court.address}
              </p>
            )}
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        {booking.slot && (
          <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(booking.slot.date)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              {formatTime(booking.slot.start_time)}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <span className="text-sm text-slate-500">Total paid</span>
          <span className="font-bold text-slate-900">{formatPrice(booking.amount)}</span>
        </div>
      </div>
    </div>
  )
}
