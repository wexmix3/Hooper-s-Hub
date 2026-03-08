import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/map'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Redirect new users (onboarding not completed) to onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('borough, onboarding_completed')
        .eq('user_id', data.user.id)
        .single()
      const needsOnboarding = !profile?.onboarding_completed && !profile?.borough
      // Never redirect away from an explicit next param (e.g. /reset-password)
      const destination = next !== '/map' ? next : needsOnboarding ? '/onboarding' : '/map'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
