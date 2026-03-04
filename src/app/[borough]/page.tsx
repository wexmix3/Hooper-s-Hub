import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, MapPin, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Court } from '@/types'
import { formatPrice, slugToBorough } from '@/lib/utils'
import type { Metadata } from 'next'

const BOROUGH_DISPLAY: Record<string, string> = {
  manhattan: 'Manhattan',
  brooklyn: 'Brooklyn',
  queens: 'Queens',
  bronx: 'The Bronx',
  staten_island: 'Staten Island',
}

const VALID_SLUGS = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten-island']

interface PageProps {
  params: Promise<{ borough: string }>
}

export async function generateStaticParams() {
  return VALID_SLUGS.map((borough) => ({ borough }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { borough } = await params
  if (!VALID_SLUGS.includes(borough)) return {}

  const boroughKey = slugToBorough(borough)
  const displayName = BOROUGH_DISPLAY[boroughKey] ?? borough

  return {
    title: `Basketball Courts in ${displayName}, NYC`,
    description: `Find every basketball court in ${displayName}, New York City. Public parks, indoor gyms, and bookable courts with real-time crowd levels.`,
    openGraph: {
      title: `Basketball Courts in ${displayName} NYC — CourtBook`,
      description: `Discover and book basketball courts in ${displayName}. Real-time crowd levels, pickup games, and instant booking.`,
    },
  }
}

export default async function BoroughPage({ params }: PageProps) {
  const { borough } = await params

  if (!VALID_SLUGS.includes(borough)) notFound()

  const boroughKey = slugToBorough(borough)
  const displayName = BOROUGH_DISPLAY[boroughKey] ?? borough

  const supabase = await createClient()
  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('borough', boroughKey)
    .order('avg_rating', { ascending: false })

  const courtList = (courts as Court[]) ?? []
  const publicCourts = courtList.filter((c) => c.type === 'public')
  const privateCourts = courtList.filter((c) => c.type === 'private')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Basketball Courts in ${displayName}, NYC`,
    itemListElement: courtList.slice(0, 20).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SportsActivityLocation',
        name: c.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: c.address,
          addressLocality: displayName,
          addressRegion: 'NY',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: c.lat,
          longitude: c.lng,
        },
      },
    })),
  }

  const faqs = [
    {
      q: `How many basketball courts are in ${displayName}?`,
      a: `There are ${courtList.length} basketball courts in ${displayName} on CourtBook — including ${publicCourts.length} free public courts and ${privateCourts.length} private bookable gyms.`,
    },
    {
      q: `Are there indoor basketball courts in ${displayName}?`,
      a: `Yes! ${courtList.filter((c) => c.indoor).length} indoor courts are listed in ${displayName}. Use the Indoor filter to find them quickly.`,
    },
    {
      q: `Can I book a basketball court in ${displayName} online?`,
      a: `Absolutely. ${privateCourts.length} courts in ${displayName} support instant online booking through CourtBook. View available times and pay securely with your card.`,
    },
    {
      q: `How do I find a pickup game in ${displayName}?`,
      a: `Use the Runs feature on CourtBook to find pickup games near you in ${displayName}. You can also create your own run and invite other players.`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <div className="bg-[#1B3A5C] text-white px-5 pt-8 pb-10">
          <Link href="/" className="flex items-center gap-2 text-blue-200 text-sm mb-6 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            CourtBook NYC
          </Link>
          <h1 className="text-3xl font-extrabold mb-2">
            Basketball Courts in {displayName}
          </h1>
          <p className="text-blue-200">
            {courtList.length} courts · {publicCourts.length} free · {privateCourts.length} bookable
          </p>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
          {/* Court list */}
          <section>
            <div className="space-y-4">
              {courtList.map((court) => (
                <Link key={court.id} href={`/courts/${court.id}`}>
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-slate-900 text-base">{court.name}</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />{court.address}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        court.type === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {court.type === 'private' ? 'Private' : 'Free'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {court.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {court.avg_rating.toFixed(1)}
                        </div>
                      )}
                      {court.indoor && (
                        <span className="text-xs text-slate-500">Indoor</span>
                      )}
                      {court.is_bookable && court.hourly_rate && (
                        <div className="flex items-center gap-1 text-[#FF6B2C] font-bold text-xs ml-auto">
                          <Zap size={10} />
                          {formatPrice(court.hourly_rate)}/hr
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl p-5 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-[#FF6B2C] rounded-2xl p-6 text-center text-white">
            <h3 className="font-extrabold text-xl mb-2">Ready to find your court?</h3>
            <p className="text-orange-100 text-sm mb-4">
              Sign up free to get crowd levels, book courts, and join pickup games.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-[#FF6B2C] font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Get started →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
