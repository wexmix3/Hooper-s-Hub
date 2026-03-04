/**
 * Seed script: NYC Open Data → courts table
 *
 * Usage:
 *   cp .env.local.example .env.local
 *   # Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   npx tsx scripts/seed-nyc-courts.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// NYC Open Data — Parks Facilities (basketball courts)
const NYC_OPEN_DATA_URL =
  'https://data.cityofnewyork.us/resource/e4ej-j6hn.json?$limit=500&$where=type%20like%20%27%25basketball%25%27'

interface NycFacility {
  name?: string
  location_1?: { latitude: string; longitude: string }
  address?: string
  borough?: string
  type?: string
}

const BOROUGH_MAP: Record<string, string> = {
  manhattan: 'manhattan',
  brooklyn: 'brooklyn',
  queens: 'queens',
  bronx: 'bronx',
  'staten island': 'staten_island',
  'staten_island': 'staten_island',
}

async function seedPublicCourts() {
  console.log('🏀 Fetching NYC Open Data basketball facilities…')

  let facilities: NycFacility[] = []
  try {
    const res = await fetch(NYC_OPEN_DATA_URL)
    facilities = await res.json()
    console.log(`  Found ${facilities.length} records`)
  } catch (err) {
    console.warn('  Could not fetch NYC Open Data:', err)
    console.log('  Using fallback sample courts…')
    facilities = getSampleCourts()
  }

  const courts = facilities
    .filter((f) => f.location_1?.latitude && f.location_1?.longitude && f.name)
    .map((f) => {
      const lat = parseFloat(f.location_1!.latitude)
      const lng = parseFloat(f.location_1!.longitude)
      const boroughRaw = (f.borough ?? '').toLowerCase().trim()
      const borough = BOROUGH_MAP[boroughRaw] ?? 'manhattan'

      return {
        name: (f.name ?? 'Unknown Court').trim(),
        type: 'public' as const,
        address: f.address ?? 'New York, NY',
        borough,
        location: `POINT(${lng} ${lat})`,
        lat,
        lng,
        surface_type: 'asphalt' as const,
        indoor: false,
        has_lights: false,
        rim_count: 2,
        rim_height: '10ft',
        is_bookable: false,
        photos: [] as string[],
        amenities: [] as string[],
      }
    })

  console.log(`  Inserting ${courts.length} courts…`)

  // Batch upsert in chunks
  const CHUNK_SIZE = 50
  let inserted = 0

  for (let i = 0; i < courts.length; i += CHUNK_SIZE) {
    const chunk = courts.slice(i, i + CHUNK_SIZE)
    const { error } = await supabase
      .from('courts')
      .upsert(chunk, { onConflict: 'name,address', ignoreDuplicates: true })

    if (error) {
      console.error(`  Chunk ${i / CHUNK_SIZE + 1} error:`, error.message)
    } else {
      inserted += chunk.length
      process.stdout.write(`\r  Progress: ${inserted}/${courts.length}`)
    }
  }

  console.log(`\n✅ Seeded ${inserted} public courts`)
}

function getSampleCourts() {
  return [
    { name: 'West 4th Street Courts', borough: 'manhattan', address: 'Sixth Ave & W 4th St, New York, NY 10012', location_1: { latitude: '40.7308', longitude: '-74.0004' } },
    { name: 'Rucker Park', borough: 'manhattan', address: '155th St & 8th Ave, New York, NY 10039', location_1: { latitude: '40.8307', longitude: '-73.9389' } },
    { name: 'Goose Park', borough: 'brooklyn', address: 'Nostrand Ave & Flatbush Ave, Brooklyn, NY', location_1: { latitude: '40.6501', longitude: '-73.9496' } },
    { name: 'Domino Park', borough: 'brooklyn', address: '15 River St, Brooklyn, NY 11249', location_1: { latitude: '40.7156', longitude: '-73.9701' } },
    { name: 'Roy Wilkins Park', borough: 'queens', address: '177-01 Baisley Blvd, Jamaica, NY 11434', location_1: { latitude: '40.6724', longitude: '-73.7637' } },
    { name: 'Juniper Valley Park', borough: 'queens', address: 'Cooper Ave, Middle Village, NY 11379', location_1: { latitude: '40.7182', longitude: '-73.8720' } },
    { name: 'Mullaly Park', borough: 'bronx', address: '930 River Ave, Bronx, NY 10452', location_1: { latitude: '40.8249', longitude: '-73.9239' } },
    { name: 'Crotona Park', borough: 'bronx', address: '1700 Fulton Ave, Bronx, NY 10457', location_1: { latitude: '40.8420', longitude: '-73.8965' } },
    { name: 'Clove Lakes Park', borough: 'staten island', address: 'Victory Blvd, Staten Island, NY 10301', location_1: { latitude: '40.6293', longitude: '-74.1139' } },
  ]
}

seedPublicCourts().catch(console.error)
