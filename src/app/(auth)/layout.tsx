export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A5C] to-[#0F2942] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF6B2C] rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🏀</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Hooper&apos;s Hub</span>
          </div>
          <p className="text-blue-200 text-sm mt-2">Every court in NYC. One app.</p>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
