import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, calculateFee } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slotId, courtId } = await request.json()
    if (!slotId || !courtId) {
      return NextResponse.json({ error: 'Missing slotId or courtId' }, { status: 400 })
    }

    // Fetch slot and court in parallel
    const [{ data: slot, error: slotErr }, { data: court, error: courtErr }] = await Promise.all([
      supabase
        .from('time_slots')
        .select('*')
        .eq('id', slotId)
        .eq('court_id', courtId)
        .single(),
      supabase.from('courts').select('*').eq('id', courtId).single(),
    ])

    if (slotErr || !slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    if (courtErr || !court) return NextResponse.json({ error: 'Court not found' }, { status: 404 })

    if (slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 })
    }

    // Hold the slot for 10 minutes
    const heldUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { error: holdErr } = await supabase
      .from('time_slots')
      .update({ status: 'held', booked_by: user.id, held_until: heldUntil })
      .eq('id', slotId)
      .eq('status', 'available') // Optimistic lock

    if (holdErr) {
      return NextResponse.json({ error: 'Failed to hold slot — try again' }, { status: 409 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const platformFee = calculateFee(slot.price)
    const total = slot.price + platformFee

    // Get court owner's Stripe account if available
    let ownerStripeAccountId: string | null = null
    if (court.owner_id) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_connected')
        .eq('user_id', court.owner_id)
        .single()
      if (ownerProfile?.stripe_connected && ownerProfile.stripe_account_id) {
        ownerStripeAccountId = ownerProfile.stripe_account_id
      }
    }

    // Build payment_intent_data with Connect if owner is set up
    const paymentIntentData: Record<string, unknown> = {}
    if (ownerStripeAccountId) {
      paymentIntentData.application_fee_amount = platformFee
      paymentIntentData.transfer_data = { destination: ownerStripeAccountId }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${court.name} — Court Booking`,
              description: `${slot.date} ${slot.start_time}–${slot.end_time}`,
              images: court.photos?.[0] ? [court.photos[0]] : [],
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      ...(Object.keys(paymentIntentData).length > 0 && { payment_intent_data: paymentIntentData }),
      metadata: {
        slot_id: slotId,
        court_id: courtId,
        user_id: user.id,
        platform_fee: platformFee.toString(),
      },
      success_url: `${appUrl}/booking-confirmed/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courts/${courtId}`,
      expires_at: Math.floor(Date.now() / 1000) + 10 * 60, // 10 min
    })

    // Store session ID on the slot
    await supabase
      .from('time_slots')
      .update({ stripe_session_id: session.id })
      .eq('id', slotId)

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
