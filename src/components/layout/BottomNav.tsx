'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, LayoutGrid, Users, User, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const BASE_NAV = [
  { href: '/map', label: 'Map', icon: Map },
  { href: '/browse', label: 'Browse', icon: LayoutGrid },
  { href: '/runs', label: 'Runs', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [isVenueOwner, setIsVenueOwner] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('is_venue_owner')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.is_venue_owner) setIsVenueOwner(true)
        })
    })
  }, [])

  const navItems = isVenueOwner
    ? [...BASE_NAV.slice(0, 3), { href: '/dashboard', label: 'Dashboard', icon: BarChart3 }, BASE_NAV[3]]
    : BASE_NAV

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 min-h-[44px]',
                active ? 'text-[#FF6B2C]' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
