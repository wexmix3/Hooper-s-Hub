/**
 * Seed: Private courts, time slots, and sample runs
 * Usage: npx tsx scripts/seed-private-courts.ts
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const PRIVATE_COURTS = [
  {
    name: 'Brooklyn Hoops Academy',
    borough: 'brooklyn',
    address: '450 Flatbush Ave, Brooklyn, NY 11225',
    lat: 40.6588,
    lng: -73.9596,
    hourly_rate: 12000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'parking', 'locker_room'],
    description: 'A premium indoor basketball facility in the heart of Flatbush. Two full courts with hardwood floors, professional lighting, and locker rooms. Host of several local leagues.',
  },
  {
    name: 'Harlem Court Club',
    borough: 'manhattan',
    address: '2090 Adam Clayton Powell Jr Blvd, New York, NY 10027',
    lat: 40.8081,
    lng: -73.9503,
    hourly_rate: 15000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'locker_room', 'scoreboard', 'bleachers'],
    description: 'Harlem\'s premier indoor basketball destination. Regulation hardwood court with stadium seating, scoreboard, and full locker facilities. Steps from the A/B/C/D trains.',
  },
  {
    name: 'Queens Elite Basketball',
    borough: 'queens',
    address: '89-02 Sutphin Blvd, Jamaica, NY 11435',
    lat: 40.7024,
    lng: -73.8073,
    hourly_rate: 10000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'parking'],
    description: 'Spacious indoor facility in Jamaica, Queens. Climate-controlled with rubber sport-court flooring, perfect for year-round play. Ample parking available.',
  },
  {
    name: 'South Bronx Training Center',
    borough: 'bronx',
    address: '425 Grand Concourse, Bronx, NY 10451',
    lat: 40.8192,
    lng: -73.9232,
    hourly_rate: 8500,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'bleachers'],
    description: 'Community-focused indoor basketball center on the Grand Concourse. Affordable rates, great vibes. Open late on weekends.',
  },
  {
    name: 'Staten Island Sports Complex',
    borough: 'staten_island',
    address: '1000 Richmond Terrace, Staten Island, NY 10301',
    lat: 40.6436,
    lng: -74.1238,
    hourly_rate: 9000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'parking', 'vending'],
    description: 'Full-size indoor basketball court at Staten Island\'s largest sports complex. Parking available on site. Great for private games and training sessions.',
  },
  {
    name: 'Williamsburg Indoor Courts',
    borough: 'brooklyn',
    address: '240 Kent Ave, Brooklyn, NY 11249',
    lat: 40.7137,
    lng: -73.9659,
    hourly_rate: 14000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'locker_room', 'wifi', 'scoreboard'],
    description: 'Modern basketball facility in Williamsburg with two courts, WiFi, and professional scoring systems. Popular with media creatives and competitive rec players alike.',
  },
  {
    name: 'Midtown Athletic Center',
    borough: 'manhattan',
    address: '340 W 49th St, New York, NY 10019',
    lat: 40.7615,
    lng: -73.9894,
    hourly_rate: 18000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'locker_room', 'parking', 'wifi', 'pro_shop'],
    description: 'Premium midtown facility with a full NBA-regulation hardwood court. Professional-grade equipment, personal training available, and a fully stocked pro shop.',
  },
  {
    name: 'Astoria Basketball Center',
    borough: 'queens',
    address: '31-01 Broadway, Astoria, NY 11106',
    lat: 40.7621,
    lng: -73.9306,
    hourly_rate: 11000,
    indoor: true,
    amenities: ['restroom', 'water_fountain', 'bleachers', 'vending'],
    description: 'Welcoming indoor gym in the heart of Astoria. Great for pickup games and private rentals. Two half-courts or one full court available.',
  },
]

// Generate time slots for the next 14 days
function generateSlots(courtId: string, hourlyRate: number) {
  const slots: {
    court_id: string
    date: string
    start_time: string
    end_time: string
    status: 'available'
    price: number
  }[] = []
  const today = new Date()

  for (let d = 0; d < 14; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const startHour = isWeekend ? 8 : 6
    const endHour = 22

    for (let h = startHour; h < endHour; h++) {
      // Skip past hours on today
      if (d === 0 && h <= new Date().getHours()) continue
      const startStr = `${String(h).padStart(2, '0')}:00:00`
      const endStr = `${String(h + 1).padStart(2, '0')}:00:00`
      slots.push({
        court_id: courtId,
        date: dateStr,
        start_time: startStr,
        end_time: endStr,
        status: 'available',
        price: hourlyRate,
      })
    }
  }
  return slots
}

async function seedPrivateCourts() {
  console.log('🏟️  Seeding private courts…')

  const courts = PRIVATE_COURTS.map((c) => ({
    ...c,
    type: 'private' as const,
    surface_type: 'hardwood' as const,
    has_lights: true,
    rim_count: 4,
    rim_height: '10ft',
    is_bookable: true,
    photos: [] as string[],
    owner_id: null,
    avg_rating: 0,
    review_count: 0,
    location: `POINT(${c.lng} ${c.lat})`,
  }))

  const { data: inserted, error } = await supabase
    .from('courts')
    .upsert(courts, { onConflict: 'name,borough', ignoreDuplicates: false })
    .select('id, name, hourly_rate')

  if (error) {
    console.error('Error inserting courts:', error.message)
    return
  }

  console.log(`  ✅ Inserted/updated ${inserted?.length ?? 0} private courts`)

  // Generate time slots for each court
  console.log('⏰ Generating time slots…')
  let totalSlots = 0

  // First delete existing future slots for these courts to avoid duplicates
  const courtIds = (inserted ?? []).map((c: { id: string }) => c.id)
  if (courtIds.length > 0) {
    await supabase
      .from('time_slots')
      .delete()
      .in('court_id', courtIds)
      .eq('status', 'available')
      .gte('date', new Date().toISOString().split('T')[0])
  }

  for (const court of (inserted ?? []) as { id: string; name: string; hourly_rate: number }[]) {
    const slots = generateSlots(court.id, court.hourly_rate)
    const CHUNK = 100
    for (let i = 0; i < slots.length; i += CHUNK) {
      const { error: slotErr } = await supabase
        .from('time_slots')
        .insert(slots.slice(i, i + CHUNK))
      if (slotErr) console.error(`  Slot error for ${court.name}:`, slotErr.message)
    }
    totalSlots += slots.length
    process.stdout.write(`\r  Generated slots: ${totalSlots}`)
  }
  console.log(`\n  ✅ Generated ${totalSlots} time slots`)
}

async function seedSampleRuns() {
  console.log('🏃 Seeding sample runs…')

  // Get a few public courts to attach runs to
  const { data: publicCourts } = await supabase
    .from('courts')
    .select('id, name, borough')
    .eq('type', 'public')
    .limit(6)

  if (!publicCourts || publicCourts.length === 0) {
    console.log('  No public courts found, skipping runs')
    return
  }

  const today = new Date()
  const runs = [
    {
      court_id: publicCourts[0]?.id,
      organizer_id: null, // anonymous/system
      title: 'Saturday Morning Run – All Welcome',
      date: getFutureDate(2),
      start_time: '10:00:00',
      end_time: '12:00:00',
      spots_total: 10,
      spots_filled: 4,
      skill_level: 'any',
      description: 'Casual morning run, all skill levels welcome. Bring water, we got next.',
      status: 'open',
    },
    {
      court_id: publicCourts[1]?.id ?? publicCourts[0]?.id,
      organizer_id: null,
      title: 'Competitive 5-on-5 — Intermediate+',
      date: getFutureDate(1),
      start_time: '18:00:00',
      end_time: '20:00:00',
      spots_total: 10,
      spots_filled: 7,
      skill_level: 'intermediate',
      description: 'Looking for serious players. We run full court 5-on-5, winner stays on.',
      status: 'open',
    },
    {
      court_id: publicCourts[2]?.id ?? publicCourts[0]?.id,
      organizer_id: null,
      title: 'Sunday Hoops – Advanced',
      date: getFutureDate(3),
      start_time: '14:00:00',
      end_time: '17:00:00',
      spots_total: 12,
      spots_filled: 5,
      skill_level: 'advanced',
      description: 'Advanced run for experienced players. We play hard, respect the game.',
      status: 'open',
    },
    {
      court_id: publicCourts[3]?.id ?? publicCourts[0]?.id,
      organizer_id: null,
      title: 'Beginner Friendly Practice Session',
      date: getFutureDate(4),
      start_time: '09:00:00',
      end_time: '11:00:00',
      spots_total: 8,
      spots_filled: 2,
      skill_level: 'beginner',
      description: 'Great for newer players! Come work on your game in a no-pressure environment.',
      status: 'open',
    },
    {
      court_id: publicCourts[4]?.id ?? publicCourts[0]?.id,
      organizer_id: null,
      title: 'Lunchtime Run – Midtown',
      date: getFutureDate(1),
      start_time: '12:00:00',
      end_time: '13:30:00',
      spots_total: 6,
      spots_filled: 5,
      skill_level: 'any',
      description: 'Quick lunchtime run for working folks. 3-on-3 format.',
      status: 'open',
    },
    {
      court_id: publicCourts[5]?.id ?? publicCourts[0]?.id,
      organizer_id: null,
      title: 'Evening 3v3 Tournament',
      date: getFutureDate(5),
      start_time: '19:00:00',
      end_time: '21:00:00',
      spots_total: 12,
      spots_filled: 0,
      skill_level: 'intermediate',
      description: 'Organizing a friendly 3v3 bracket. Teams of 3, first to 21 wins.',
      status: 'open',
    },
  ].filter((r) => r.court_id)

  const { error } = await supabase.from('runs').insert(runs)
  if (error) {
    console.error('Error inserting runs:', error.message)
    return
  }
  console.log(`  ✅ Inserted ${runs.length} sample runs`)
}

function getFutureDate(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

async function main() {
  await seedPrivateCourts()
  await seedSampleRuns()
  console.log('\n🎉 Done! Private courts, time slots, and runs are ready.')
}

main().catch(console.error)
