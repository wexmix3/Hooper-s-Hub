import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'email_change' | null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!error) {
      // Check if new user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('borough, onboarding_completed')
          .eq('user_id', user.id)
          .single()
        const needsOnboarding = !profile?.onboarding_completed && !profile?.borough
        // For password recovery, always go to /reset-password; otherwise check onboarding
        const destination = type === 'recovery' ? '/reset-password' : needsOnboarding ? '/onboarding' : '/map'
        return NextResponse.redirect(`${origin}${destination}`)
      }
      return NextResponse.redirect(`${origin}/map`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
