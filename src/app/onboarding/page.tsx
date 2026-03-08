'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/brand/Logo'
import type { Borough } from '@/types'

const BOROUGHS: Array<{ value: Borough; name: string; emoji: string; vibe: string }> = [
  { value: 'manhattan', name: 'Manhattan', emoji: '🗽', vibe: 'West 4th · Rucker · The Cage' },
  { value: 'brooklyn', name: 'Brooklyn', emoji: '🌉', vibe: 'Dyckman · Marcy · Gowanus' },
  { value: 'queens', name: 'Queens', emoji: '✈️', vibe: 'Flushing · Queensbridge · Elmhurst' },
  { value: 'bronx', name: 'The Bronx', emoji: '🎤', vibe: "St. Mary's · Goat Park · Orchard Beach" },
  { value: 'staten_island', name: 'Staten Island', emoji: '⛴️', vibe: 'Silver Lake · Willowbrook' },
]

const SKILLS = [
  { value: 'beginner' as const, label: 'Beginner', desc: 'Learning the game, casual play' },
  { value: 'intermediate' as const, label: 'Intermediate', desc: 'Solid fundamentals, regular player' },
  { value: 'advanced' as const, label: 'Advanced', desc: 'Competitive, play to win' },
  { value: 'any' as const, label: 'Just browsing', desc: "I'm here for courts, not runs" },
]

const POSITIONS = [
  { value: 'point_guard', label: 'PG', desc: 'Point Guard' },
  { value: 'shooting_guard', label: 'SG', desc: 'Shooting Guard' },
  { value: 'small_forward', label: 'SF', desc: 'Small Forward' },
  { value: 'power_forward', label: 'PF', desc: 'Power Forward' },
  { value: 'center', label: 'C', desc: 'Center' },
  { value: 'any', label: 'Any', desc: 'I play everywhere' },
]

const PLAY_STYLES = [
  { value: 'competitive', label: 'Competitive', desc: 'I play to win every game' },
  { value: 'casual', label: 'Casual', desc: 'Just here to have fun' },
  { value: 'both', label: 'Both', desc: 'Depends on the day' },
]

function CheckIcon() {
  return (
    <div className="w-5 h-5 bg-[#FF6B2C] rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [borough, setBorough] = useState<Borough | null>(null)
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'any' | null>(null)
  const [position, setPosition] = useState<string | null>(null)
  const [playStyle, setPlayStyle] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    })
  }, [router])

  async function handleFinish() {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const displayName =
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.email ? user.email.split('@')[0] : 'Hooper')

    await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          display_name: displayName,
          borough: borough ?? null,
          skill_level: skillLevel ?? 'any',
          position: position ?? null,
          play_style: playStyle ?? null,
          onboarding_completed: true,
        },
        { onConflict: 'user_id' }
      )

    router.push('/map')
  }

  function skip() {
    if (step < 3) { setStep(s => s + 1); return }
    handleFinish()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <Logo size={28} />
        <button onClick={skip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          Skip
        </button>
      </div>

      {/* Step indicator */}
      <div className="px-5 mb-6">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${
                s <= step ? 'bg-[#FF6B2C]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 overflow-y-auto pb-4">
        {/* Step 1: Borough */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
              Where do you hoop?
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              We&apos;ll show you the best courts in your borough first.
            </p>
            <div className="space-y-3">
              {BOROUGHS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBorough(b.value)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    borough === b.value
                      ? 'border-[#FF6B2C] bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.emoji}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{b.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{b.vibe}</p>
                    </div>
                    {borough === b.value && <div className="ml-auto"><CheckIcon /></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Skill Level */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
              What&apos;s your level?
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              We&apos;ll match you with runs that fit your game.
            </p>
            <div className="space-y-3">
              {SKILLS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSkillLevel(s.value)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    skillLevel === s.value
                      ? 'border-[#FF6B2C] bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    {skillLevel === s.value && <CheckIcon />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Player Identity */}
        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-1">
              Your player identity
            </h1>
            <p className="text-slate-500 text-sm mb-5">
              Tell us more about how you play. Optional — you can set this later.
            </p>

            <h2 className="font-semibold text-slate-700 text-sm mb-2">Position</h2>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPosition(position === p.value ? null : p.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    position === p.value
                      ? 'border-[#FF6B2C] bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{p.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>

            <h2 className="font-semibold text-slate-700 text-sm mb-2">Play Style</h2>
            <div className="space-y-2">
              {PLAY_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlayStyle(playStyle === s.value ? null : s.value)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    playStyle === s.value
                      ? 'border-[#FF6B2C] bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    {playStyle === s.value && <CheckIcon />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 pt-6">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!borough}
            className="w-full bg-[#FF6B2C] disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-opacity"
          >
            Continue
          </button>
        ) : step === 2 ? (
          <button
            onClick={() => setStep(3)}
            disabled={!skillLevel}
            className="w-full bg-[#FF6B2C] disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-opacity"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="w-full bg-[#FF6B2C] disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-opacity"
          >
            {saving ? 'Setting up your profile…' : "Let's hoop 🏀"}
          </button>
        )}
      </div>
    </div>
  )
}
