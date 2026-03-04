import BottomNav from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F8FAFC]">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  )
}
