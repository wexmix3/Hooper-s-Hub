'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/brand/Logo'

const NAV_LINKS = [
  { href: '/map', label: 'Map' },
  { href: '/browse', label: 'Browse' },
  { href: '/runs', label: 'Runs' },
]

function avatarColor(name: string) {
  const colors = ['#FF6B2C', '#1B3A5C', '#7C3AED', '#059669', '#DC2626', '#D97706']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % colors.length
  return colors[hash]
}

export function TopNav() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setLoggedIn(true)
      supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setProfileAvatar(data.avatar_url)
          if (data?.display_name) setProfileName(data.display_name)
        })
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo → Home */}
        <Link href="/" className="flex-shrink-0">
          <Logo size={28} />
        </Link>

        {/* Center: Nav links (desktop only) */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-orange-50 text-[#FF6B2C]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Auth state */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {loggedIn ? (
            <Link href="/profile" aria-label="Profile">
              {profileAvatar ? (
                <Image
                  src={profileAvatar}
                  alt={profileName ?? 'Profile'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border-2 border-slate-200"
                  unoptimized
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm"
                  style={{ backgroundColor: profileName ? avatarColor(profileName) : '#1B3A5C' }}
                >
                  {profileName ? profileName[0].toUpperCase() : '?'}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#FF6B2C] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#e55a1f] transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
