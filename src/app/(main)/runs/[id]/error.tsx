'use client'

import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function RunError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <AlertCircle size={40} className="text-red-400 mb-4" />
      <h2 className="font-bold text-slate-900 text-lg mb-1">Couldn't load this run</h2>
      <p className="text-slate-500 text-sm mb-6">
        {error.message || 'Something went wrong. Try again or browse other runs.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[#FF6B2C] text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <RefreshCw size={15} />
          Try again
        </button>
        <Link
          href="/runs"
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          Browse runs
        </Link>
      </div>
    </div>
  )
}
