import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] to-[#0F2942] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo — always links home */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#FF6B2C] rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🏀</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Hooper&apos;s Hub</span>
          </Link>
          <p className="text-blue-200 text-sm mt-2">Every court in NYC. One app.</p>
          <Link href="/venue-signup" className="mt-3 inline-block text-xs text-blue-300 hover:text-white transition-colors">
            List your court →
          </Link>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
