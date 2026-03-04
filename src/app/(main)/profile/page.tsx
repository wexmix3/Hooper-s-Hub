'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Calendar, ChevronRight, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Profile } from '@/types'

const SKILL_OPTIONS = [
  { value: 'any', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [skillLevel, setSkillLevel] = useState('any')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setDisplayName(data.display_name)
        setSkillLevel(data.skill_level ?? 'any')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ display_name: displayName, skill_level: skillLevel })
      .eq('id', profile.id)

    setProfile((p) => p ? { ...p, display_name: displayName, skill_level: skillLevel as Profile['skill_level'] } : p)
    setEditing(false)
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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
      {/* Profile header */}
      <div className="bg-[#1B3A5C] px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={72}
              height={72}
              className="rounded-full object-cover border-3 border-white/30"
            />
          ) : (
            <div className="w-18 h-18 rounded-full bg-[#FF6B2C] flex items-center justify-center text-white text-3xl font-bold w-[72px] h-[72px]">
              {profile?.display_name?.[0] ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{profile?.display_name}</h1>
            <p className="text-blue-200 text-sm capitalize">{profile?.skill_level ?? 'All levels'}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-lg p-5 space-y-4 border border-slate-100 mb-4">
          <h2 className="font-bold text-slate-900">Edit Profile</h2>
          <Input
            id="display_name"
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Select
            id="skill_level"
            label="Skill Level"
            options={SKILL_OPTIONS}
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 py-4 space-y-3">
        <Link
          href="/profile/bookings"
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 active:scale-[0.99] transition-transform"
        >
          <Calendar size={20} className="text-[#1B3A5C]" />
          <span className="flex-1 font-medium text-slate-900">My Bookings</span>
          <ChevronRight size={18} className="text-slate-400" />
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 w-full text-left active:scale-[0.99] transition-transform"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="flex-1 font-medium text-red-500">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
