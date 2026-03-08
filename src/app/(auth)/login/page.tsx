'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/profile'
  const message = searchParams.get('message')
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(urlError)
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailUnconfirmed(false)

    const supabase = createClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('confirm your email')) {
        // Supabase explicitly says email isn't confirmed — show resend UI
        setEmailUnconfirmed(true)
        setError(null)
      } else if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        setError('Email or password is incorrect. Double-check and try again.')
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // New users go through onboarding first
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('borough, onboarding_completed')
        .eq('user_id', authData.user.id)
        .single()
      if (!profile?.onboarding_completed && !profile?.borough) {
        router.push('/onboarding')
        router.refresh()
        return
      }
    }

    router.push(redirectTo)
    router.refresh()
  }

  async function handleResendConfirmation() {
    if (!email) { setError('Enter your email above first.'); return }
    setResendLoading(true)
    const supabase = createClient()
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setResendLoading(false)
    setResendSent(true)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
      <p className="text-slate-500 text-sm mb-6">Sign in to find your next game</p>

      {message === 'password_updated' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          Password updated — sign in with your new password.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {emailUnconfirmed && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <p className="font-semibold text-amber-800 mb-1">Check your email first</p>
          <p className="text-amber-700 mb-3">
            We sent a confirmation link to <strong>{email || 'your email'}</strong>. Click it before signing in.
          </p>
          {resendSent ? (
            <p className="text-green-700 font-medium">New email sent!</p>
          ) : (
            <button
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="text-amber-800 font-semibold underline hover:no-underline disabled:opacity-50"
            >
              {resendLoading ? 'Sending…' : 'Resend confirmation email'}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        loading={googleLoading}
        onClick={handleGoogleLogin}
      >
        <Chrome size={18} />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#FF6B2C] font-semibold hover:underline">
          Sign up free
        </Link>
      </p>

      {!emailUnconfirmed && (
        <p className="text-center text-xs text-slate-400 mt-3">
          Signed up but never got a confirmation email?{' '}
          <button
            type="button"
            onClick={() => { if (email) setEmailUnconfirmed(true); else setError('Enter your email above first.') }}
            className="underline hover:no-underline"
          >
            Resend it
          </button>
        </p>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
