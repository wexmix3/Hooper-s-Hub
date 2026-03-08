'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleResend() {
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

  if (success) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm mb-4">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <p className="text-xs text-slate-400 mb-3">Didn&apos;t get it? Check spam or</p>
        {resendSent ? (
          <p className="text-green-600 font-medium text-sm">New email sent!</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-[#FF6B2C] font-semibold text-sm underline hover:no-underline disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'resend confirmation email'}
          </button>
        )}
        <Link href="/login" className="block mt-6 text-slate-400 text-sm hover:text-slate-600">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
      <p className="text-slate-500 text-sm mb-6">Join thousands of NYC ballers</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full mb-4"
        loading={googleLoading}
        onClick={handleGoogleSignup}
      >
        <Chrome size={18} />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Display Name"
          placeholder="Hooper McHoop"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={16} />}
          required
        />
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
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-4">
        By signing up, you agree to our Terms and Privacy Policy.
      </p>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-[#FF6B2C] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
