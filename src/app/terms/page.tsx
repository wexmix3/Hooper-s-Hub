import Link from 'next/link'
import type { Metadata } from 'next'
import { Logo } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: "Hooper's Hub NYC Terms of Service — how booking, cancellations, and venue listings work.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-5 py-4 flex items-center gap-3">
        <Link href="/"><Logo size={24} /></Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: January 1, 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Hooper&apos;s Hub NYC (&quot;the Service&quot;), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
        </Section>

        <Section title="2. User Accounts">
          <p>You must be 18 or older to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          <p>You agree not to impersonate others, provide false information, or use the Service for any unlawful purpose.</p>
        </Section>

        <Section title="3. Court Booking Terms">
          <p><strong>Cancellation Policy:</strong> Cancellations made more than 24 hours before your booking start time are eligible for a full refund. Cancellations within 24 hours receive a 50% refund. No-shows receive no refund.</p>
          <p><strong>Slot Holds:</strong> When you initiate checkout, a slot is held for 10 minutes. If payment is not completed, the slot is automatically released.</p>
          <p><strong>Court Condition:</strong> Hooper&apos;s Hub is a marketplace and does not own or operate any courts. Venue owners are responsible for maintaining their facilities. We are not liable for injuries, property damage, or unsatisfactory court conditions.</p>
        </Section>

        <Section title="4. Venue Owner Terms">
          <p><strong>Platform Fee:</strong> Hooper&apos;s Hub charges an 8% platform fee on all bookings processed through the Service. This fee is deducted from each payment before transfer to the venue owner.</p>
          <p><strong>Payment Processing:</strong> Payments are processed via Stripe Connect. Venue owners must maintain a valid Stripe account to receive payments. Payouts are subject to Stripe&apos;s standard processing times.</p>
          <p><strong>Listing Accuracy:</strong> Venue owners are responsible for ensuring that court listings are accurate, including availability, pricing, amenities, and photos. Misleading listings may result in account suspension.</p>
          <p><strong>Content Guidelines:</strong> All listing content must be lawful and not infringe on any third-party rights. Hooper&apos;s Hub reserves the right to remove listings that violate these guidelines.</p>
        </Section>

        <Section title="5. Crowd Reporting">
          <p>Crowd reports are user-generated content. You agree not to submit false or misleading crowd reports. Reports older than 2 hours are automatically removed from display. Abuse of the crowd reporting feature may result in account suspension.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>The Hooper&apos;s Hub name, logo, and all associated content are the property of Hooper&apos;s Hub NYC. You may not reproduce, distribute, or create derivative works without written permission.</p>
          <p>By submitting reviews, photos, or other content, you grant Hooper&apos;s Hub a non-exclusive, royalty-free license to use that content in connection with the Service.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>To the maximum extent permitted by law, Hooper&apos;s Hub is not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </Section>

        <Section title="8. Dispute Resolution">
          <p>Any disputes arising from these Terms or use of the Service shall be resolved through binding arbitration under the American Arbitration Association rules, conducted in New York, NY. You waive your right to a jury trial or class action.</p>
        </Section>

        <Section title="9. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </Section>

        <Section title="10. Contact">
          <p>Questions? Email us at <a href="mailto:legal@hoopershub.nyc" className="text-[#FF6B2C] hover:underline">legal@hoopershub.nyc</a> or visit our <Link href="/support" className="text-[#FF6B2C] hover:underline">Support page</Link>.</p>
        </Section>
      </div>

      <footer className="border-t border-slate-100 px-5 py-6 text-center text-sm text-slate-400">
        <Link href="/" className="hover:text-slate-600">← Back to Hooper&apos;s Hub</Link>
      </footer>
    </div>
  )
}
