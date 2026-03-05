import Link from 'next/link'
import { Map, Users, Zap, Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Hooper's Hub NYC — Every Basketball Court in NYC. One App.",
  description:
    'Discover every basketball court in New York City — public parks and private gyms. See real-time crowd levels, book private courts instantly, and join pickup games near you.',
}

const FEATURES = [
  {
    icon: <Map size={28} className="text-[#FF6B2C]" />,
    title: 'Every Court on One Map',
    description:
      'We unified hundreds of public NYC Parks courts with private bookable gyms. No more bouncing between apps.',
  },
  {
    icon: <Users size={28} className="text-[#FF6B2C]" />,
    title: 'Real-Time Crowd Levels',
    description:
      'Community-powered crowd reports for public courts. Know before you go if the courts are empty or packed.',
  },
  {
    icon: <Zap size={28} className="text-[#FF6B2C]" />,
    title: 'Instant Court Booking',
    description:
      'Book private courts in seconds. No phone calls, no back-and-forth. Secure payment, instant confirmation.',
  },
  {
    icon: <Star size={28} className="text-[#FF6B2C]" />,
    title: 'Organize Pickup Games',
    description:
      'Create or join pickup runs at any court. Chat with players, track spots, and never play 4-on-4 again.',
  },
]

const BOROUGHS = [
  { slug: 'manhattan', name: 'Manhattan' },
  { slug: 'brooklyn', name: 'Brooklyn' },
  { slug: 'queens', name: 'Queens' },
  { slug: 'bronx', name: 'The Bronx' },
  { slug: 'staten-island', name: 'Staten Island' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B2C] rounded-xl flex items-center justify-center">
            <span className="text-white text-base">🏀</span>
          </div>
          <span className="text-[#1B3A5C] text-lg font-bold">Hooper&apos;s Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-slate-600 text-sm font-medium hover:text-slate-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-[#FF6B2C] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#E55A1F] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A5C] to-[#0F2942] text-white px-5 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FF6B2C]/20 text-[#FF6B2C] rounded-full px-4 py-2 text-sm font-semibold mb-6 border border-[#FF6B2C]/30">
            🏀 Now live in all 5 boroughs
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Every Court in NYC.
            <br />
            <span className="text-[#FF6B2C]">One App.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Find public and private basketball courts, see who&apos;s playing right now,
            book a gym in seconds, and connect with NYC ballers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-[#FF6B2C] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#E55A1F] transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/map"
              className="bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Explore the map →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">
          Built for NYC ballers
        </h2>
        <p className="text-slate-500 text-center mb-12">
          Everything you need to find your game — on one platform.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Borough */}
      <section className="bg-white border-y border-slate-100 px-5 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">
            Explore by Borough
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {BOROUGHS.map((b) => (
              <Link
                key={b.slug}
                href={`/${b.slug}`}
                className="px-6 py-3 bg-[#1B3A5C] text-white font-semibold rounded-xl hover:bg-[#0F2942] transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 text-center bg-[#FF6B2C]">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to hoop?</h2>
          <p className="text-orange-100 mb-8">
            Join thousands of NYC players who use Hooper&apos;s Hub to find their next game.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#FF6B2C] font-bold px-10 py-4 rounded-xl text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            Sign up free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2942] text-blue-300 px-5 py-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Hooper&apos;s Hub NYC</span>
            <span className="text-blue-400 text-sm">— Every court, one app.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/map" className="hover:text-white transition-colors">Map</Link>
            <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
            <Link href="/runs" className="hover:text-white transition-colors">Runs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
