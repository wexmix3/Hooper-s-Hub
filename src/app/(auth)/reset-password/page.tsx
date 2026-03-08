'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      if (err.message.toLowerCase().includes('session') || err.message.toLowerCase().includes('expired')) {
        setError('Reset link has expired. Please request a new one.')
        setLoading(false)
        return
      }
      if (err.message.toLowerCase().includes('same password') || err.message.toLowerCase().includes('different from')) {
        setError('New password must be different from your current password.')
        setLoading(false)
        return
      }
      setError(err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    // Session is already active — go straight to profile
    setTimeout(() => {
      router.push('/profile')
      router.refresh()
    }, 2000)
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password updated!</h2>
        <p className="text-slate-500 text-sm">Taking you to your profile…</p>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Set new password</h1>
      <p className="text-slate-500 text-sm mb-6">Choose a strong password you haven&apos;t used before.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
          {error.includes('expired') && (
            <span>
              {' '}
              <a href="/forgot-password" className="font-semibold underline">Request a new link →</a>
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          type="password"
          label="New Password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          required
          autoComplete="new-password"
        />
        <Input
          id="confirm"
          type="password"
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<Lock size={16} />}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </div>
  )
}
