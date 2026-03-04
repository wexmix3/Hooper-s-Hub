'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, LayoutGrid, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/map', label: 'Map', icon: Map },
  { href: '/browse', label: 'Browse', icon: LayoutGrid },
  { href: '/runs', label: 'Runs', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-16 safe-area-inset-bottom">
      <div className="flex h-full">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200',
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
