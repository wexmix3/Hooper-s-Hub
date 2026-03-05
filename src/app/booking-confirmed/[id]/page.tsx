import Link from 'next/link'
import { CheckCircle2, Calendar, Clock, MapPin, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmedPage({ params }: PageProps) {
  const { id } = await params

  // id is either a booking id or a Stripe checkout session id
  const supabase = await createClient()

  type BookingResult = {
    id: string
    amount: number
    court: { name: string; address: string } | { name: string; address: string }[]
    slot: { date: string; start_time: string; end_time: string } | { date: string; start_time: string; end_time: string }[]
  }

  let booking: BookingResult | null = null

  // Handle Stripe session ID (starts with cs_)
  if (id.startsWith('cs_')) {
    // Look up booking by stripe session
    const { data: slot } = await supabase
      .from('time_slots')
      .select('id, date, start_time, end_time, court_id, price')
      .eq('stripe_session_id', id)
      .single()

    if (slot) {
      const { data: b } = await supabase
        .from('bookings')
        .select('id, amount, court:courts(name, address), slot:time_slots(date, start_time, end_time)')
        .eq('slot_id', slot.id)
        .single()
      booking = b as BookingResult | null
    }
  } else {
    const { data: b } = await supabase
      .from('bookings')
      .select('id, amount, court:courts(name, address), slot:time_slots(date, start_time, end_time)')
      .eq('id', id)
      .single()
    booking = b as typeof booking
  }

  if (!booking) {
    // Still show a success page even if we can't look up the booking
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-3">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8">Your court is reserved. Check your email for details.</p>
          <Link href="/profile/bookings" className="bg-[#1B3A5C] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0F2942] transition-colors inline-block">
            View My Bookings
          </Link>
        </div>
      </div>
    )
  }

  const court = Array.isArray(booking.court) ? booking.court[0] : booking.court
  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1B3A5C] to-[#0F2942] text-white px-5 py-12 text-center">
        <CheckCircle2 size={56} className="text-green-400 mx-auto mb-4" />
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold mb-2">You&apos;re booked!</h1>
        <p className="text-blue-200">Your court is reserved and ready.</p>
      </div>

      <div className="px-4 py-6 max-w-sm mx-auto space-y-4">
        {/* Details card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-lg">{court?.name}</h2>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <MapPin size={15} className="text-[#1B3A5C] flex-shrink-0" />
            <span>{court?.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar size={15} className="text-[#1B3A5C] flex-shrink-0" />
            <span>{formatDate(slot?.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Clock size={15} className="text-[#1B3A5C] flex-shrink-0" />
            <span>{formatTime(slot?.start_time)} – {formatTime(slot?.end_time)}</span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between font-bold">
            <span className="text-slate-500 font-normal">Amount paid</span>
            <span className="text-[#1B3A5C]">{formatPrice(booking.amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <a
          href={`/api/bookings/${booking.id}/calendar`}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-5 py-3.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
        >
          <Download size={16} />
          Add to Calendar (.ics)
        </a>

        <Link
          href="/profile/bookings"
          className="w-full flex items-center justify-center bg-[#1B3A5C] text-white font-bold px-5 py-3.5 rounded-xl hover:bg-[#0F2942] transition-colors"
        >
          View My Bookings
        </Link>

        <Link
          href="/map"
          className="w-full flex items-center justify-center text-slate-500 text-sm hover:text-slate-700 transition-colors py-2"
        >
          Back to map
        </Link>

        <p className="text-center text-xs text-slate-400 px-2">
          Cancellations 24+ hours before your booking are fully refunded. Within 24 hours, 50% is refunded.
        </p>
      </div>
    </div>
  )
}
