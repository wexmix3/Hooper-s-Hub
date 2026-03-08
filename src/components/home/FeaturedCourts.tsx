'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CourtImage } from '@/components/courts/CourtImage'

interface CourtPreview {
  id: string
  name: string
  neighborhood: string | null
  borough: string
  photos: string[] | null
  avg_rating: number
  type: string
  indoor: boolean
}

const BOROUGH_SHORT: Record<string, string> = {
  manhattan: 'MAN',
  brooklyn: 'BK',
  queens: 'QNS',
  bronx: 'BX',
  staten_island: 'SI',
}

export function FeaturedCourts() {
  const [courts, setCourts] = useState<CourtPreview[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('courts')
      .select('id, name, neighborhood, borough, photos, avg_rating, type, indoor')
      .eq('type', 'public')
      .order('avg_rating', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setCourts(data as CourtPreview[])
      })
  }, [])

  if (courts.length === 0) return null

  return (
    <section className="px-5 py-16 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
          Iconic NYC Courts
        </h2>
        <p className="text-slate-500 mb-8">The most legendary spots in the city.</p>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {courts.map((court) => (
            <Link
              key={court.id}
              href={`/courts/${court.id}`}
              className="flex-shrink-0 w-48 group"
            >
              <div className="relative h-32 rounded-xl overflow-hidden bg-slate-200 mb-2">
                <CourtImage
                  photos={court.photos ?? []}
                  courtId={court.id}
                  courtName={court.name}
                  isIndoor={court.indoor}
                  alt={court.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-semibold">
                  <MapPin size={10} />
                  {BOROUGH_SHORT[court.borough] ?? court.borough}
                </div>
              </div>
              <p className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-[#FF6B2C] transition-colors">
                {court.name}
              </p>
              {court.neighborhood && (
                <p className="text-xs text-slate-400 mt-0.5">{court.neighborhood}</p>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/browse"
            className="inline-block border border-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl hover:border-[#FF6B2C] hover:text-[#FF6B2C] transition-colors text-sm"
          >
            Browse all courts →
          </Link>
        </div>
      </div>
    </section>
  )
}
