import Link from 'next/link'
import type { Metadata } from 'next'
import { Logo } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Hooper's Hub NYC Privacy Policy — how we collect, use, and protect your data.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-5 py-4 flex items-center gap-3">
        <Link href="/"><Logo size={24} /></Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: January 1, 2026</p>

        <Section title="1. Data We Collect">
          <p><strong>Account information:</strong> Email address, display name, skill level, and borough when you create an account.</p>
          <p><strong>Location data:</strong> We request your device location only when you use the map feature to show nearby courts. This is never stored without your explicit consent.</p>
          <p><strong>Booking history:</strong> Records of courts you&apos;ve booked, dates, times, and amounts paid.</p>
          <p><strong>User-generated content:</strong> Reviews, crowd reports, and run descriptions you submit.</p>
          <p><strong>Payment information:</strong> Handled entirely by Stripe. We never see or store your full card number.</p>
          <p><strong>Usage data:</strong> Pages visited, features used, and performance metrics via Vercel Analytics.</p>
        </Section>

        <Section title="2. How We Use Your Data">
          <p>We use your data to: provide and improve the Service, process bookings and payments, show relevant courts near your location, send transactional emails (booking confirmations, cancellations), display your activity on your profile, and analyze usage patterns to improve the product.</p>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="3. Third-Party Services">
          <p><strong>Supabase:</strong> Database and authentication. Data is stored on servers in the US. Privacy policy at supabase.com/privacy.</p>
          <p><strong>Stripe:</strong> Payment processing and Stripe Connect for venue owners. Privacy policy at stripe.com/privacy.</p>
          <p><strong>Mapbox:</strong> Map tiles and geocoding. Privacy policy at mapbox.com/legal/privacy.</p>
          <p><strong>Vercel:</strong> Hosting and analytics. Privacy policy at vercel.com/legal/privacy-policy.</p>
        </Section>

        <Section title="4. Data Retention">
          <p>We retain your account data for as long as your account is active. Booking records are retained for 7 years for tax and legal compliance. You may request deletion of your account and associated data at any time.</p>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to: access a copy of your data, correct inaccurate information, request deletion of your account, opt out of marketing communications, and data portability.</p>
          <p>To exercise these rights, email <a href="mailto:privacy@hoopershub.nyc" className="text-[#FF6B2C] hover:underline">privacy@hoopershub.nyc</a>.</p>
        </Section>

        <Section title="6. Cookies">
          <p>We use essential session cookies for authentication. We do not use tracking cookies for advertising. Vercel Analytics uses privacy-friendly, cookieless tracking.</p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>The Service is not intended for users under 18. We do not knowingly collect data from minors.</p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>We may update this Privacy Policy. We will notify registered users of significant changes via email.</p>
        </Section>

        <Section title="9. Contact">
          <p>For privacy questions: <a href="mailto:privacy@hoopershub.nyc" className="text-[#FF6B2C] hover:underline">privacy@hoopershub.nyc</a></p>
        </Section>
      </div>

      <footer className="border-t border-slate-100 px-5 py-6 text-center text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">← Back to Hooper&apos;s Hub</Link>
      </footer>
    </div>
  )
}
