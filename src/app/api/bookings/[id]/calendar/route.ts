import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id: bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, court:courts(name, address), slot:time_slots(date, start_time, end_time)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (!booking) return new NextResponse('Not found', { status: 404 })

  const court = Array.isArray(booking.court) ? booking.court[0] : booking.court
  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot

  // Generate ICS
  const dtStart = `${slot.date.replace(/-/g, '')}T${slot.start_time.replace(/:/g, '').slice(0, 6)}00`
  const dtEnd = `${slot.date.replace(/-/g, '')}T${slot.end_time.replace(/:/g, '').slice(0, 6)}00`
  const uid = `booking-${bookingId}@hoopershub.nyc`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hooper\'s Hub NYC//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Basketball @ ${court?.name}`,
    `LOCATION:${court?.address}`,
    `DESCRIPTION:Your court booking at ${court?.name} via Hooper's Hub NYC.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="hoopershub-booking.ics"`,
    },
  })
}
