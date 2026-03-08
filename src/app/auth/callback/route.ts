import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/map'

  // Handle OAuth provider errors (user cancelled, access denied, etc.)
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')
  if (oauthError && !code) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', oauthError)
    return NextResponse.redirect(url)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Password reset — skip onboarding check, go straight to the reset form
      if (next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // For all other flows, check if new user needs onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('borough, onboarding_completed')
        .eq('user_id', data.user.id)
        .single()
      const needsOnboarding = !profile?.onboarding_completed && !profile?.borough
      const destination = needsOnboarding ? '/onboarding' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  const url = new URL('/login', origin)
  url.searchParams.set('error', 'Sign in failed. Please try again.')
  return NextResponse.redirect(url)
}
