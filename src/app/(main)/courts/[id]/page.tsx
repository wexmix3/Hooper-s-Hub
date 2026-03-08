import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Users, Pencil, Clock, CalendarPlus } from 'lucide-react'
import { PhotoCarousel } from '@/components/courts/PhotoCarousel'
import { CourtAttributes } from '@/components/courts/CourtAttributes'
import { AvailabilityCalendar } from '@/components/courts/AvailabilityCalendar'
import { ReviewList } from '@/components/reviews/ReviewList'
import { CrowdBadge } from '@/components/courts/CrowdBadge'
import { Badge } from '@/components/ui/Badge'
import type { Court, CrowdReport } from '@/types'
import { BOROUGH_LABELS, formatPrice, timeAgo, isCrowdFresh } from "@/lib/utils"
import { AMENITY_LABELS } from "@/types"
import type { Metadata } from 'next'
import { SaveCourtButton } from '@/components/courts/SaveCourtButton'
import { ShareButton } from '@/components/ui/ShareButton'
import { ComingSoonNotify } from '@/components/courts/ComingSoonNotify'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('courts').select('name, address').eq('id', id).single()
  return {
    title: data ? `${data.name} — ${data.address}` : 'Court Details',
  }
}

export default async function CourtDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const [{ data: court }, { data: latestCrowdData }, { data: upcomingRuns }] = await Promise.all([
    supabase.from('courts').select('*').eq('id', id).single(),
    supabase
      .from('crowd_reports')
      .select('*')
      .eq('court_id', id)
      .order('reported_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('runs')
      .select('id, title, date, start_time, spots_total, spots_filled, skill_level, status, organizer:profiles!runs_organizer_id_fkey(display_name)')
      .eq('court_id', id)
      .in('status', ['open', 'full'])
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(3),
  ])

  if (!court) notFound()

  const latestCrowd =
    latestCrowdData && isCrowdFresh(latestCrowdData.reported_at)
      ? (latestCrowdData as CrowdReport)
      : null

  const c = court as Court

  return (
    <div className="bg-[#F8FAFC]">
      {/* Back button + save button overlaid on photo */}
      <div className="relative">
        <Link
          href="/browse"
          className="absolute top-4 left-4 z-10 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute top-4 right-4 z-10">
          <SaveCourtButton courtId={c.id} className="bg-black/40 backdrop-blur-sm border-0 text-white hover:text-red-400" />
        </div>
        <PhotoCarousel photos={c.photos ?? []} name={c.name} />
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{c.name}</h1>
            <Badge variant={c.type === 'private' ? 'info' : 'success'}>
              {c.type === 'private' ? 'Private' : 'Public'}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
            <MapPin size={13} />
            <span>{c.address}</span>
          </div>

          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-3 flex-wrap">
              {c.avg_rating > 0 && (
                <div className="flex items-center gap-1 text-slate-700">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{c.avg_rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">({c.review_count} reviews)</span>
                </div>
              )}
              {c.is_bookable && c.hourly_rate && (
                <span className="text-[#FF6B2C] font-bold">{formatPrice(c.hourly_rate)}/hr</span>
              )}
            </div>
            <ShareButton title={c.name} />
          </div>
        </div>

        {/* Description */}
        {c.description && (
          <p className="text-slate-600 text-sm leading-relaxed">{c.description}</p>
        )}

        {/* Court attributes */}
        <div>
          <h2 className="font-bold text-slate-900 mb-3">Court Info</h2>
          <CourtAttributes court={c} />
        </div>

        {/* Amenities */}
        {c.amenities?.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-900 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {c.amenities.map((a) => (
                <Badge key={a} variant="default">{AMENITY_LABELS[a] ?? a}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Crowd level (public courts) */}
        {c.type === 'public' && (
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-900">Live Crowd Level</h2>
              <Link
                href={`/courts/${id}/report`}
                className="text-sm text-[#FF6B2C] font-semibold flex items-center gap-1"
              >
                <Users size={14} />
                Report
              </Link>
            </div>
            {latestCrowd ? (
              <div className="flex items-center gap-3">
                <CrowdBadge level={latestCrowd.crowd_level} />
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {timeAgo(latestCrowd.reported_at)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No recent reports (within 2 hrs)</p>
            )}
          </div>
        )}

        {/* Booking section (private courts) */}
        {c.is_bookable && c.booking_status === 'coming_soon' && (
          <ComingSoonNotify courtName={c.name} hourlyRate={c.hourly_rate} />
        )}
        {c.is_bookable && c.booking_status !== 'coming_soon' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">Available Times</h2>
            </div>
            <AvailabilityCalendar courtId={id} />
          </div>
        )}

        {/* Upcoming runs at this court */}
        {upcomingRuns && upcomingRuns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">Upcoming Runs Here</h2>
              <Link href={`/runs?court=${id}`} className="text-sm text-[#FF6B2C] font-semibold">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {upcomingRuns.map((run: any) => (
                <Link
                  key={run.id}
                  href={`/runs/${run.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 active:scale-[0.99] transition-transform"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{run.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(run.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {run.start_time.slice(0, 5).replace(/^0/, '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${run.status === 'full' ? 'text-red-500' : 'text-green-600'}`}>
                      {run.spots_filled}/{run.spots_total} spots
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{run.skill_level}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Reviews</h2>
            <Link
              href={`/courts/${id}/review`}
              className="text-sm text-[#FF6B2C] font-semibold flex items-center gap-1"
            >
              <Pencil size={14} />
              Write Review
            </Link>
          </div>
          <ReviewList courtId={id} />
        </div>
      </div>
    </div>
  )
}
