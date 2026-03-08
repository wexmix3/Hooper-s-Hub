'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title: string
  className?: string
}

export function ShareButton({ title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // User cancelled or browser unsupported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium transition-colors',
        copied ? 'text-green-600' : 'text-slate-500 hover:text-slate-800',
        className
      )}
      aria-label="Share"
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
