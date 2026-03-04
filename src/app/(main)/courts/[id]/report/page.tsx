import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CrowdReportForm } from '@/components/reviews/CrowdReportForm'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Report Crowd Level' }

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href={`/courts/${id}`} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Report Crowd Level</h1>
      </div>
      <div className="px-4 py-5">
        <CrowdReportForm courtId={id} />
      </div>
    </div>
  )
}
