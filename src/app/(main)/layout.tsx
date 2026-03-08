import BottomNav from '@/components/layout/BottomNav'
import { NetworkBanner } from '@/components/layout/NetworkBanner'
import { TopNav } from '@/components/layout/TopNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F8FAFC]">
      <NetworkBanner />
      <TopNav />
      {/* pb accounts for 64px bottom nav + iOS safe area; removed on desktop */}
      <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
