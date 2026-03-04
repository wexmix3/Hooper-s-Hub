import { cn } from '@/lib/utils'
import { CROWD_CONFIG, type CrowdLevel } from '@/types'
import { Users } from 'lucide-react'

interface CrowdBadgeProps {
  level: CrowdLevel
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function CrowdBadge({ level, size = 'md', showIcon = true }: CrowdBadgeProps) {
  const config = CROWD_CONFIG[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        config.color,
        config.bg,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      {showIcon && <Users size={size === 'sm' ? 10 : 13} />}
      {config.label}
    </span>
  )
}
