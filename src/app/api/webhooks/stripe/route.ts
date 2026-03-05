import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { slot_id, court_id, user_id, platform_fee } = session.metadata ?? {}

      if (!slot_id || !court_id || !user_id) break

      // Mark slot as booked
      await supabase
        .from('time_slots')
        .update({ status: 'booked', held_until: null })
        .eq('id', slot_id)

      // Create booking record with platform fee
      await supabase.from('bookings').insert({
        user_id,
        court_id,
        slot_id,
        stripe_payment_intent: session.payment_intent as string,
        amount: session.amount_total ?? 0,
        platform_fee: parseInt(platform_fee ?? '0'),
        status: 'confirmed',
      })
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const { slot_id } = session.metadata ?? {}
      if (!slot_id) break

      await supabase
        .from('time_slots')
        .update({ status: 'available', booked_by: null, held_until: null, stripe_session_id: null })
        .eq('id', slot_id)
        .eq('status', 'held')
      break
    }

    case 'payment_intent.payment_failed': {
      // Find slot by stripe session — release it
      const pi = event.data.object as Stripe.PaymentIntent
      const { data: slot } = await supabase
        .from('time_slots')
        .select('id')
        .eq('status', 'held')
        .limit(1)
        .single()
      if (slot) {
        await supabase
          .from('time_slots')
          .update({ status: 'available', booked_by: null, held_until: null, stripe_session_id: null })
          .eq('id', slot.id)
      }
      console.log(`Payment failed for PI: ${pi.id}`)
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string
      if (!paymentIntentId) break

      // Find booking by payment intent
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, slot_id')
        .eq('stripe_payment_intent', paymentIntentId)
        .single()

      if (booking) {
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            refund_amount: charge.amount_refunded,
          })
          .eq('id', booking.id)

        // Release slot
        await supabase
          .from('time_slots')
          .update({ status: 'available', booked_by: null, stripe_session_id: null })
          .eq('id', booking.slot_id)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
