'use client'

import { cn } from '@/lib/utils'

interface TopBarProps {
  title?: string
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
  transparent?: boolean
}

export function TopBar({ title, left, right, className, transparent }: TopBarProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between px-4 h-14 z-30',
        !transparent && 'bg-white border-b border-slate-100 shadow-sm',
        transparent && 'absolute top-0 left-0 right-0',
        className
      )}
    >
      <div className="w-10">{left}</div>
      {title && (
        <h1 className="text-base font-bold text-slate-900 flex-1 text-center">{title}</h1>
      )}
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  )
}
