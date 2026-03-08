'use client'

import { useState } from 'react'
import { Bell, CheckCircle } from 'lucide-react'

interface ComingSoonNotifyProps {
  courtName: string
  hourlyRate?: number | null
}

export function ComingSoonNotify({ courtName, hourlyRate }: ComingSoonNotifyProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Simulate a brief network delay
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={16} className="text-amber-600" />
        <span className="font-bold text-slate-900 text-sm">Booking Coming Soon</span>
      </div>
      <p className="text-slate-600 text-sm mb-4">
        {courtName} will be bookable soon on Hooper&apos;s Hub
        {hourlyRate ? ` starting at $${(hourlyRate / 100).toFixed(0)}/hr` : ''}.
        Get notified when it goes live.
      </p>

      {submitted ? (
        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
          <CheckCircle size={16} />
          You&apos;re on the list!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60 flex-shrink-0"
          >
            {loading ? '…' : 'Notify Me'}
          </button>
        </form>
      )}
    </div>
  )
}
