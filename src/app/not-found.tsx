import Link from 'next/link'
import { Map } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl mb-4 select-none" aria-hidden="true">🏀</div>
      <h1 className="font-display text-5xl font-extrabold text-slate-900 mb-2">Airball.</h1>
      <p className="text-slate-500 text-lg mb-1">404 — Page not found</p>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">
        That shot missed the rim completely. The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/map"
        className="inline-flex items-center gap-2 bg-[#FF6B2C] text-white font-semibold px-6 py-3 rounded-2xl active:scale-95 transition-transform"
      >
        <Map size={18} />
        Find a court
      </Link>
      <Link href="/" className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors">
        ← Back to home
      </Link>
    </div>
  )
}
