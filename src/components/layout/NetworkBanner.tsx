'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function NetworkBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#FF6B2C] text-white flex items-center justify-center gap-2 py-2 text-sm font-medium">
      <WifiOff size={14} />
      You&apos;re offline. Some features may be unavailable.
    </div>
  )
}
