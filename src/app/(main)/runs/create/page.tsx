import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateRunForm } from '@/components/runs/CreateRunForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create a Run' }

export default function CreateRunPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-slate-100">
        <Link href="/runs" className="p-1.5 rounded-lg hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Create a Run</h1>
      </div>
      <div className="px-4 py-5">
        <CreateRunForm />
      </div>
    </div>
  )
}
