'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/brand/Logo'

const SUBJECTS = [
  'Bug Report',
  'Feature Request',
  'Venue Inquiry',
  'Booking Issue',
  'Payment Issue',
  'Other',
]

export default function SupportPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Bug Report')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.from('support_tickets').insert({
      name,
      email,
      subject,
      message,
    })

    if (err) { setError('Failed to send message. Try emailing us directly.'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3">
        <Link href="/"><Logo size={24} /></Link>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">Support</h1>
        <p className="text-slate-500 mb-8">Get help with bookings, technical issues, or general questions.</p>

        {/* Quick help */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-8">
          <h2 className="font-bold text-slate-900 mb-3">Quick help</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>📅 <strong>Booking issues:</strong> <Link href="/profile/bookings" className="text-[#FF6B2C] hover:underline">View your bookings</Link></li>
            <li>🏀 <strong>Finding courts:</strong> <Link href="/map" className="text-[#FF6B2C] hover:underline">Open the map</Link></li>
            <li>🏟️ <strong>List your venue:</strong> <Link href="/venue-signup" className="text-[#FF6B2C] hover:underline">Venue signup</Link></li>
            <li>📧 <strong>Direct email:</strong> <a href="mailto:support@hoopershub.nyc" className="text-[#FF6B2C] hover:underline">support@hoopershub.nyc</a></li>
          </ul>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-bold text-slate-900 text-lg mb-2">Message sent!</h2>
            <p className="text-slate-500 text-sm">We&apos;ll get back to you within 1-2 business days.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-5">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <select
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 bg-white"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 resize-none"
                  rows={5}
                  placeholder="Describe your issue in detail…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                <Mail size={16} /> Send message
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
