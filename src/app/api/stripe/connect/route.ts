import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Get or create Stripe Connect account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, display_name, venue_email')
    .eq('user_id', user.id)
    .single()

  let accountId = profile?.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile?.venue_email ?? user.email,
      capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
      business_type: 'individual',
      metadata: { user_id: user.id },
    })
    accountId = account.id

    await supabase
      .from('profiles')
      .update({ stripe_account_id: accountId })
      .eq('user_id', user.id)
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?stripe=refresh`,
    return_url: `${appUrl}/api/stripe/connect/callback?account_id=${accountId}`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
