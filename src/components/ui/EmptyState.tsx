import Link from 'next/link'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="text-5xl mb-4 opacity-60">{icon}</div>
      )}
      <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="bg-[#FF6B2C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#E55A1F] transition-colors text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="bg-[#FF6B2C] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#E55A1F] transition-colors text-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
