'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import type { Profile } from '@/types'
import { toast } from 'sonner'

const SKILL_OPTIONS = [
  { value: 'any', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const POSITION_OPTIONS = [
  { value: '', label: 'Select position…' },
  { value: 'point_guard', label: 'Point Guard (PG)' },
  { value: 'shooting_guard', label: 'Shooting Guard (SG)' },
  { value: 'small_forward', label: 'Small Forward (SF)' },
  { value: 'power_forward', label: 'Power Forward (PF)' },
  { value: 'center', label: 'Center (C)' },
  { value: 'any', label: 'Any / Versatile' },
]

const PLAY_STYLE_OPTIONS = [
  { value: '', label: 'Select play style…' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'casual', label: 'Casual' },
  { value: 'both', label: 'Both' },
]

const BOROUGH_OPTIONS = [
  { value: '', label: 'Select borough…' },
  { value: 'manhattan', label: 'Manhattan' },
  { value: 'brooklyn', label: 'Brooklyn' },
  { value: 'queens', label: 'Queens' },
  { value: 'bronx', label: 'The Bronx' },
  { value: 'staten_island', label: 'Staten Island' },
]

export default function ProfileEditPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [skillLevel, setSkillLevel] = useState('any')
  const [position, setPosition] = useState('')
  const [playStyle, setPlayStyle] = useState('')
  const [borough, setBorough] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const p = data as Profile
        setProfile(p)
        setDisplayName(p.display_name ?? '')
        setBio(p.bio ?? '')
        setSkillLevel(p.skill_level ?? 'any')
        setPosition(p.position ?? '')
        setPlayStyle(p.play_style ?? '')
        setBorough(p.borough ?? '')
        setAvatarUrl(p.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !userId) return
    if (!displayName.trim()) { toast.error('Display name is required.'); return }
    if (displayName.trim().length < 2) { toast.error('Display name must be at least 2 characters.'); return }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        skill_level: skillLevel,
        position: position || null,
        play_style: playStyle || null,
        borough: borough || null,
        avatar_url: avatarUrl,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (error) { toast.error('Failed to save: ' + error.message); return }
    toast.success('Profile updated!')
    router.push('/profile')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </Link>
        <h1 className="font-bold text-slate-900 text-lg">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Avatar */}
        {userId && (
          <div className="flex justify-center">
            <AvatarUpload
              userId={userId}
              avatarUrl={avatarUrl}
              displayName={displayName || 'H'}
              onUpload={(url) => setAvatarUrl(url)}
            />
          </div>
        )}

        {/* Display Name */}
        <Input
          id="display_name"
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={30}
        />

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Bio <span className="text-slate-400 font-normal">({bio.length}/150)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            placeholder="What's your game?"
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] resize-none"
          />
        </div>

        {/* Skill Level */}
        <Select
          id="skill_level"
          label="Skill Level"
          options={SKILL_OPTIONS}
          value={skillLevel}
          onChange={(e) => setSkillLevel(e.target.value)}
        />

        {/* Position */}
        <Select
          id="position"
          label="Position"
          options={POSITION_OPTIONS}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        {/* Play Style */}
        <Select
          id="play_style"
          label="Play Style"
          options={PLAY_STYLE_OPTIONS}
          value={playStyle}
          onChange={(e) => setPlayStyle(e.target.value)}
        />

        {/* Preferred Borough */}
        <Select
          id="borough"
          label="Preferred Borough"
          options={BOROUGH_OPTIONS}
          value={borough}
          onChange={(e) => setBorough(e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/profile"
            className="flex-1 flex items-center justify-center py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" className="flex-1" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
