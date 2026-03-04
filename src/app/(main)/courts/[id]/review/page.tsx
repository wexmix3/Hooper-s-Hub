import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Write a Review' }

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href={`/courts/${id}`} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Write a Review</h1>
      </div>
      <div className="px-4 py-5">
        <ReviewForm courtId={id} />
      </div>
    </div>
  )
}
