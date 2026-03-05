import BottomNav from '@/components/layout/BottomNav'
import { NetworkBanner } from '@/components/layout/NetworkBanner'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F8FAFC]">
      <NetworkBanner />
      {/* pb accounts for 64px nav + iOS safe area */}
      <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </div>
  )
}
