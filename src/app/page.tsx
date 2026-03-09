'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Target, CalendarCheck, Map, Users, Zap, Star, ChevronDown, ChevronUp, Instagram, Twitter, Building2, CreditCard, RefreshCw } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { LiveBadge } from '@/components/home/LiveBadge'
import { CourtCount } from '@/components/home/CourtCount'
import { FeaturedCourts } from '@/components/home/FeaturedCourts'

const BOROUGHS = [
  { slug: 'manhattan', name: 'Manhattan', filterValue: 'manhattan' },
  { slug: 'brooklyn', name: 'Brooklyn', filterValue: 'brooklyn' },
  { slug: 'queens', name: 'Queens', filterValue: 'queens' },
  { slug: 'bronx', name: 'The Bronx', filterValue: 'bronx' },
  { slug: 'staten-island', name: 'Staten Island', filterValue: 'staten_island' },
]

const FAQS = [
  {
    q: 'Is Hooper\'s Hub free?',
    a: "Yes. Browsing courts, checking crowd levels, and joining pickup runs is 100% free. You only pay if you book a private court.",
  },
  {
    q: 'How do I list my gym or court?',
    a: "Click 'List your venue' and create an account. You set your own prices and availability. We handle payments and take a small 8% platform fee only when you earn.",
  },
  {
    q: 'Are the crowd reports accurate?',
    a: "They're community-powered — real players report what they see. Reports older than 2 hours are automatically hidden so you always see fresh data.",
  },
  {
    q: 'What boroughs do you cover?',
    a: "All five. Manhattan, Brooklyn, Queens, The Bronx, and Staten Island. We have every public park court from NYC Open Data plus a growing list of private gyms.",
  },
  {
    q: 'Can I organize a pickup game?',
    a: "Yes! Create a 'Run' at any court — public or private. Set the time, skill level, and number of spots. Other players can join and you can coordinate in the built-in chat.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-slate-900 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-100">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsLoggedIn(true)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white font-body">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <Link href="/"><Logo size={28} /></Link>
        <div className="flex items-center gap-3">
          <Link href="/venue-signup" className="text-slate-500 text-sm font-medium hover:text-slate-900 hidden md:block">
            List your court
          </Link>
          {isLoggedIn ? (
            <Link
              href="/map"
              className="bg-[#FF6B2C] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#E55A1F] transition-colors"
            >
              Open app →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 text-sm font-medium hover:text-slate-900 hidden sm:block">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#FF6B2C] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#E55A1F] transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#0F172A] text-white px-5 py-20 text-center relative overflow-hidden">
        {/* Radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, #1B3A5C 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <Logo size={48} dark />
          </div>
          <div className="inline-flex items-center gap-2 bg-[#FF6B2C]/20 text-[#FF6B2C] rounded-full px-4 py-2 text-sm font-semibold mb-3 border border-[#FF6B2C]/30">
            🏀 Now live in all 5 boroughs
          </div>
          <div className="mb-6">
            <LiveBadge />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight mb-5 text-white">
            Every Court in NYC.
            <br />
            <span className="text-[#FF6B2C]">One App.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Find public parks, browse bookable indoor gyms, and organize pickup runs with NYC ballers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/browse"
              className="bg-[#FF6B2C] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#E55A1F] transition-colors"
            >
              Find courts near you →
            </Link>
            <Link
              href="/map"
              className="bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              See the map
            </Link>
          </div>

          {/* Court photo */}
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1546519638405-a9c0d51ca0b7?w=1200&q=80"
                alt="NYC basketball court"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
                🏀 <CourtCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="px-5 py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-3">
            How it works
          </h2>
          <p className="text-slate-500 text-center mb-14 text-base sm:text-lg">
            From couch to court in under a minute.
          </p>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {[
              {
                num: '01',
                icon: <MapPin size={28} className="text-[#FF6B2C]" />,
                title: 'Open the map',
                desc: 'See every court in the 5 boroughs — public parks and private gyms, all in one view.',
              },
              {
                num: '02',
                icon: <Target size={28} className="text-[#FF6B2C]" />,
                title: 'Pick your spot',
                desc: 'See surface type, number of courts, lights, amenities, and neighborhood info for every court.',
              },
              {
                num: '03',
                icon: <CalendarCheck size={28} className="text-[#FF6B2C]" />,
                title: 'Book or just show up',
                desc: 'See which private courts are bookable, or join a pickup run at any public park.',
              },
            ].map((step) => (
              <div key={step.num} className="relative bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <span className="absolute top-4 right-5 text-6xl font-extrabold text-slate-100 select-none leading-none font-display">
                  {step.num}
                </span>
                <div className="mb-4 relative z-10">{step.icon}</div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2 relative z-10">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCourts />

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section className="px-5 py-16 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 text-center mb-3">
          Built for NYC ballers
        </h2>
        <p className="text-slate-500 text-center mb-12">Everything you need to find your game.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: <Map size={26} className="text-[#FF6B2C]" />, title: 'Unified Court Map', desc: 'Every public NYC Parks court + private bookable gyms. No more bouncing between apps.' },
            { icon: <Users size={26} className="text-[#FF6B2C]" />, title: 'Live Crowd Reports', desc: 'Check in at courts to share crowd levels with the community. The more hoopers join, the better it gets.' },
            { icon: <Zap size={26} className="text-[#FF6B2C]" />, title: 'Instant Booking', desc: 'Browse bookable private courts across NYC. Online booking coming soon.' },
            { icon: <Star size={26} className="text-[#FF6B2C]" />, title: 'Pickup Runs', desc: 'Create or join runs at any court. Chat, track spots, and never play 4-on-4 again.' },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-[#FF6B2C]/40 hover:shadow-md transition-all duration-200 group"
            >
              <div className="mb-4 p-2.5 bg-orange-50 rounded-xl w-fit group-hover:bg-orange-100 transition-colors">{f.icon}</div>
              <h3 className="font-display font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Venue Owners ────────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-y border-slate-100 px-5 py-20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 text-xs font-semibold mb-5">
              <Building2 size={14} /> For Venue Owners
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Own a gym or court?
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              List your space on Hooper&apos;s Hub and fill your empty court hours. No upfront cost — you only pay when you earn.
            </p>
            <Link
              href="/venue-signup"
              className="inline-block bg-[#1B3A5C] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#0F2942] transition-colors text-base"
            >
              List your venue →
            </Link>
          </div>
          <div className="space-y-5">
            {[
              { icon: <RefreshCw size={20} className="text-[#FF6B2C]" />, title: 'Simple availability management', desc: 'Set your open hours and let players find you.' },
              { icon: <CreditCard size={20} className="text-[#FF6B2C]" />, title: 'Easy payment setup', desc: 'Stripe integration coming soon — get notified when it\'s live.' },
              { icon: <Users size={20} className="text-[#FF6B2C]" />, title: 'Get discovered by NYC ballers', desc: 'Players searching for courts near you will find your venue.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-100">
                <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Borough Explorer ────────────────────────────────────────────── */}
      <section className="px-5 py-16 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 text-center mb-3">
          Explore by Borough
        </h2>
        <p className="text-slate-500 text-center mb-10">Every court. Every neighborhood.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {BOROUGHS.map((b) => (
            <Link
              key={b.slug}
              href={`/browse?borough=${b.filterValue}`}
              className="px-6 py-3.5 bg-white border border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-[#1B3A5C] hover:text-white hover:border-[#1B3A5C] transition-all duration-200 shadow-sm"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Social Proof ────────────────────────────────────────────────── */}
      <section className="bg-[#FF6B2C] px-5 py-20 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-3xl font-extrabold text-white mb-3">Ready to hoop?</h2>
          <p className="text-orange-100 mb-3 text-lg">
            Be one of the first hoopers in your borough.
          </p>
          <p className="text-orange-200 text-sm mb-8">
            Courts mapped across all 5 boroughs of New York City.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#FF6B2C] font-bold px-10 py-4 rounded-xl text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            Join the community →
          </Link>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] text-slate-400 px-5 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-10 mb-10">
            {/* Brand */}
            <div className="sm:w-1/3">
              <Logo size={28} dark />
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                Every basketball court in NYC. One app.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Twitter size={16} />
                </a>
              </div>
            </div>
            {/* Links */}
            <div className="flex-1 grid grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="/map" className="hover:text-white transition-colors">Map</Link></li>
                  <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
                  <li><Link href="/runs" className="hover:text-white transition-colors">Runs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/venue-signup" className="hover:text-white transition-colors">List Your Venue</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <span>© 2026 Hooper&apos;s Hub NYC</span>
            <span>Made for NYC ballers 🏀</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
