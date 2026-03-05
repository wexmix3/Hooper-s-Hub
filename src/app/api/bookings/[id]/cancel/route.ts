import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Load booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, slot:time_slots(*)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status === 'cancelled') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })

  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot

  // Calculate refund amount based on time until booking
  const slotDateTime = new Date(`${slot.date}T${slot.start_time}`)
  const hoursUntil = (slotDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

  let refundAmount: number
  if (hoursUntil >= 24) {
    refundAmount = booking.amount // Full refund
  } else if (hoursUntil > 0) {
    refundAmount = Math.round(booking.amount * 0.5) // 50% refund
  } else {
    return NextResponse.json({ error: 'Cannot cancel a past booking' }, { status: 400 })
  }

  // Issue Stripe refund
  if (booking.stripe_payment_intent) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent,
        amount: refundAmount,
        reason: 'requested_by_customer',
      })

      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          refund_amount: refundAmount,
          stripe_refund_id: refund.id,
        })
        .eq('id', bookingId)
    } catch (err) {
      console.error('Stripe refund error:', err)
      return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 })
    }
  } else {
    await supabase
      .from('bookings')
      .update({ status: 'cancelled', refund_amount: refundAmount })
      .eq('id', bookingId)
  }

  // Release the slot
  await supabase
    .from('time_slots')
    .update({ status: 'available', booked_by: null })
    .eq('id', booking.slot_id)

  return NextResponse.json({
    success: true,
    refund_amount: refundAmount,
    message: hoursUntil >= 24 ? 'Full refund issued' : '50% refund issued (cancelled within 24 hours)',
  })
}
