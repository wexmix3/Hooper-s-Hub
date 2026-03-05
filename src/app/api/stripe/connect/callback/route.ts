import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('account_id')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!accountId) return NextResponse.redirect(`${appUrl}/dashboard?stripe=error`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  // Verify account is complete
  const account = await stripe.accounts.retrieve(accountId)
  const connected = account.details_submitted && !account.requirements?.currently_due?.length

  await supabase
    .from('profiles')
    .update({
      stripe_account_id: accountId,
      stripe_connected: connected,
    })
    .eq('user_id', user.id)

  return NextResponse.redirect(
    `${appUrl}/dashboard?stripe=${connected ? 'connected' : 'pending'}`
  )
}
