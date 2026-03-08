'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/brand/Logo'

type Step = 1 | 2 | 3 | 4

const AMENITY_OPTIONS = [
  { id: 'restroom', label: 'Restroom' },
  { id: 'water_fountain', label: 'Water Fountain' },
  { id: 'parking', label: 'Parking' },
  { id: 'locker_room', label: 'Locker Room' },
  { id: 'bleachers', label: 'Bleachers' },
  { id: 'scoreboard', label: 'Scoreboard' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'vending', label: 'Vending Machines' },
  { id: 'pro_shop', label: 'Pro Shop' },
]

const BOROUGHS = [
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'The Bronx' },
  { value: 'staten_island', label: 'Staten Island' },
]

const SURFACE_TYPES = [
  { value: 'hardwood', label: 'Hardwood' },
  { value: 'rubber', label: 'Rubber' },
  { value: 'sport_court', label: 'Sport Court' },
  { value: 'asphalt', label: 'Asphalt' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'other', label: 'Other' },
]

export default function VenueSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCourtId, setCreatedCourtId] = useState<string | null>(null)

  // Auth fields (Step 1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  // Venue fields (Step 2)
  const [venueName, setVenueName] = useState('')
  const [address, setAddress] = useState('')
  const [borough, setBorough] = useState('manhattan')
  const [indoor, setIndoor] = useState(true)
  const [surfaceType, setSurfaceType] = useState('hardwood')
  const [rimCount, setRimCount] = useState(2)
  const [courtDimensions, setCourtDimensions] = useState('full')
  const [hasLights, setHasLights] = useState(true)
  const [amenities, setAmenities] = useState<string[]>(['restroom', 'water_fountain'])
  const [description, setDescription] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')

  // Auto-skip Step 1 if user is already signed in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setStep(2)
    })
  }, [])

  function toggleAmenity(id: string) {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  async function handleAuth() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // Check if already logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Mark as venue owner
      await supabase.from('profiles').upsert({
        user_id: user.id,
        is_venue_owner: true,
        display_name: displayName || user.email?.split('@')[0] || 'Venue Owner',
      }, { onConflict: 'user_id' })
      setStep(2)
      setLoading(false)
      return
    }

    // Sign up
    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (signupErr) { setError(signupErr.message); setLoading(false); return }
    if (!data.user) { setError('Signup failed'); setLoading(false); return }

    // Create profile as venue owner
    await supabase.from('profiles').upsert({
      user_id: data.user.id,
      display_name: displayName || email.split('@')[0],
      is_venue_owner: true,
    }, { onConflict: 'user_id' })

    setStep(2)
    setLoading(false)
  }

  async function handleVenueDetails() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const rateInCents = Math.round(parseFloat(hourlyRate) * 100)
    if (isNaN(rateInCents) || rateInCents <= 0) {
      setError('Enter a valid hourly rate')
      setLoading(false)
      return
    }

    // Geocode the address using Mapbox
    let lat = 40.7549
    let lng = -73.984
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (mapboxToken) {
      try {
        const encoded = encodeURIComponent(address)
        const geoRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${mapboxToken}&bbox=-74.26,40.48,-73.7,40.92&limit=1`
        )
        const geoData = await geoRes.json()
        if (geoData.features?.[0]?.center) {
          ;[lng, lat] = geoData.features[0].center
        }
      } catch (e) {
        // fall back to default coords
      }
    }

    // Insert court
    const { data: court, error: courtErr } = await supabase
      .from('courts')
      .insert({
        name: venueName,
        type: 'private',
        address,
        borough,
        location: `POINT(${lng} ${lat})`,
        lat,
        lng,
        indoor,
        surface_type: surfaceType,
        rim_count: rimCount,
        court_dimensions: courtDimensions,
        has_lights: hasLights,
        amenities,
        description,
        hourly_rate: rateInCents,
        is_bookable: true,
        owner_id: user.id,
        photos: [],
      })
      .select('id')
      .single()

    if (courtErr) { setError(courtErr.message); setLoading(false); return }

    // Generate time slots for 14 days (weekdays 6am-10pm, weekends 8am-10pm)
    const slots: { court_id: string; date: string; start_time: string; end_time: string; status: string; price: number }[] = []
    for (let d = 0; d < 14; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const startHour = isWeekend ? 8 : 6
      for (let h = startHour; h < 22; h++) {
        if (d === 0 && h <= new Date().getHours()) continue
        slots.push({
          court_id: court.id,
          date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00:00`,
          end_time: `${String(h + 1).padStart(2, '0')}:00:00`,
          status: 'available',
          price: rateInCents,
        })
      }
    }

    // Insert slots in chunks
    for (let i = 0; i < slots.length; i += 100) {
      await supabase.from('time_slots').insert(slots.slice(i, i + 100))
    }

    // Update profile with venue name
    await supabase
      .from('profiles')
      .update({ venue_name: venueName })
      .eq('user_id', user.id)

    setCreatedCourtId(court.id)
    setStep(3)
    setLoading(false)
  }

  async function handleConnectStripe() {
    setLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  const STEPS = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Venue' },
    { num: 3, label: 'Payments' },
    { num: 4, label: 'Done' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <Logo size={24} />
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s.num < step ? 'bg-green-500 text-white' : s.num === step ? 'bg-[#1B3A5C] text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {s.num < step ? '✓' : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${s.num === step ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-8 max-w-md mx-auto">
        {/* Step 1: Account */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">List your court</h1>
              <p className="text-slate-500 text-sm">Fill empty court hours and reach NYC's basketball community. No upfront cost.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <Input
                  type="email"
                  placeholder="you@yourgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full" onClick={handleAuth} loading={loading}>
                Continue →
              </Button>
            </div>
            <p className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FF6B2C] hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Venue Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">Venue details</h1>
              <p className="text-slate-500 text-sm">Tell players about your court.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Venue name *</label>
                <Input type="text" placeholder="e.g. Harlem Court Club" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address *</label>
                <Input type="text" placeholder="123 Main St, New York, NY" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Borough *</label>
                <select
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 bg-white"
                  value={borough}
                  onChange={(e) => setBorough(e.target.value)}
                >
                  {BOROUGHS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Surface</label>
                  <select
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 bg-white"
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value)}
                  >
                    {SURFACE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Hourly rate ($) *</label>
                  <Input type="number" placeholder="e.g. 120" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={indoor} onChange={(e) => setIndoor(e.target.checked)} />
                  <span className="text-sm text-slate-700">Indoor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={hasLights} onChange={(e) => setHasLights(e.target.checked)} />
                  <span className="text-sm text-slate-700">Has lights</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAmenity(a.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        amenities.includes(a.id)
                          ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 resize-none"
                  rows={3}
                  maxLength={500}
                  placeholder="Tell players what makes your court special…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-slate-400 text-right mt-1">{description.length}/500</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full" onClick={handleVenueDetails} loading={loading}
                disabled={!venueName || !address || !hourlyRate}
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Stripe */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">Connect payments</h1>
              <p className="text-slate-500 text-sm">Connect Stripe to receive bookings. You can always do this later.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center space-y-5">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <CreditCard size={28} className="text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Secure payments via Stripe</h3>
                <p className="text-slate-500 text-sm">We take 8% platform fee. You keep the rest, paid directly to your bank.</p>
              </div>
              <Button className="w-full" onClick={handleConnectStripe} loading={loading}>
                Connect Stripe →
              </Button>
              <button
                onClick={() => setStep(4)}
                className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
              >
                Skip for now (set up later in Dashboard)
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-2">Your court is live! 🎉</h1>
              <p className="text-slate-500 text-sm">Players can now discover and book your court on Hooper&apos;s Hub.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="bg-[#1B3A5C] text-white font-bold px-6 py-4 rounded-xl hover:bg-[#0F2942] transition-colors block"
              >
                Go to Dashboard →
              </Link>
              {createdCourtId && (
                <Link
                  href={`/courts/${createdCourtId}`}
                  className="bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-4 rounded-xl hover:bg-slate-50 transition-colors block"
                >
                  View your listing
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
