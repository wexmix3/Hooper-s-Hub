/**
 * Seed: NYC Open Data → courts table
 * Usage: npx tsx scripts/seed-nyc-courts.ts
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// NYC Open Data — Parks Facilities (basketball)
// Dataset: https://data.cityofnewyork.us/Recreation/Directory-of-Basketball-Courts/p2ry-fhkp
const ENDPOINTS = [
  // Primary: Parks Properties (basketball subcategory)
  'https://data.cityofnewyork.us/resource/enfh-gkve.json?$limit=1000&$where=typecategory=%27Court%27&$offset=',
  // Fallback: Parks facilities
  'https://data.cityofnewyork.us/resource/e4ej-j6hn.json?$limit=1000&$where=type%20like%20%27%25asketball%25%27&$offset=',
]

interface NycFacility {
  name?: string
  facilityname?: string
  facility_name?: string
  the_geom?: { coordinates?: [number, number] }
  location_1?: { latitude?: string; longitude?: string; coordinates?: [number, number] }
  latitude?: string
  longitude?: string
  address?: string
  borough?: string
  communityboard?: string
  zip?: string
}

const BOROUGH_MAP: Record<string, string> = {
  m: 'manhattan',
  mn: 'manhattan',
  manhattan: 'manhattan',
  b: 'brooklyn',
  bk: 'brooklyn',
  brooklyn: 'brooklyn',
  q: 'queens',
  qn: 'queens',
  queens: 'queens',
  x: 'bronx',
  bx: 'bronx',
  bronx: 'bronx',
  'the bronx': 'bronx',
  r: 'staten_island',
  si: 'staten_island',
  'staten island': 'staten_island',
  staten_island: 'staten_island',
}

async function fetchWithRetry(url: string, retries = 3): Promise<NycFacility[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw err
      console.log(`  Retry ${attempt}/${retries}…`)
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
  return []
}

async function fetchAllPages(baseUrl: string): Promise<NycFacility[]> {
  const results: NycFacility[] = []
  let offset = 0
  const pageSize = 1000
  while (true) {
    const page = await fetchWithRetry(baseUrl + offset)
    results.push(...page)
    if (page.length < pageSize) break
    offset += pageSize
    process.stdout.write(`\r  Fetched ${results.length} records…`)
  }
  return results
}

function extractCoords(f: NycFacility): { lat: number; lng: number } | null {
  // Try the_geom first (GeoJSON Point)
  if (f.the_geom?.coordinates) {
    const [lng, lat] = f.the_geom.coordinates
    if (lat && lng && Math.abs(lat) < 90 && Math.abs(lng) < 180) return { lat, lng }
  }
  // Try location_1 object
  if (f.location_1) {
    if (f.location_1.coordinates) {
      const [lng, lat] = f.location_1.coordinates
      if (lat && lng) return { lat, lng }
    }
    const lat = parseFloat(f.location_1.latitude ?? '')
    const lng = parseFloat(f.location_1.longitude ?? '')
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0) return { lat, lng }
  }
  // Try top-level lat/lng
  const lat = parseFloat(f.latitude ?? '')
  const lng = parseFloat(f.longitude ?? '')
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0) return { lat, lng }
  return null
}

function extractBorough(f: NycFacility): string {
  const raw = (f.borough ?? '').toLowerCase().trim()
  return BOROUGH_MAP[raw] ?? 'manhattan'
}

function extractName(f: NycFacility): string {
  return (f.facilityname ?? f.facility_name ?? f.name ?? '').trim() || 'Basketball Court'
}

async function seedPublicCourts() {
  console.log('🏀 Fetching NYC Open Data basketball courts…')

  let facilities: NycFacility[] = []

  for (const baseUrl of ENDPOINTS) {
    try {
      console.log(`  Trying ${baseUrl.split('?')[0]}…`)
      facilities = await fetchAllPages(baseUrl)
      if (facilities.length > 5) {
        console.log(`\n  Got ${facilities.length} records`)
        break
      }
    } catch (err) {
      console.warn(`  Failed:`, (err as Error).message)
    }
  }

  if (facilities.length === 0) {
    console.log('  Using built-in fallback courts…')
    facilities = getFallbackCourts()
  }

  const courts = facilities
    .map((f) => {
      const coords = extractCoords(f)
      if (!coords) return null
      const name = extractName(f)
      const borough = extractBorough(f)
      // Filter to NYC bounding box
      if (coords.lat < 40.4 || coords.lat > 40.95 || coords.lng < -74.3 || coords.lng > -73.6) return null
      return {
        name,
        type: 'public' as const,
        address: f.address ?? 'New York, NY',
        borough,
        location: `POINT(${coords.lng} ${coords.lat})`,
        lat: coords.lat,
        lng: coords.lng,
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
    .filter(Boolean) as ReturnType<typeof extractCoords> extends infer T
    ? NonNullable<{ name: string; type: 'public'; address: string; borough: string; location: string; lat: number; lng: number; surface_type: 'asphalt'; indoor: boolean; has_lights: boolean; rim_count: number; rim_height: string; is_bookable: boolean; photos: string[]; amenities: string[] }>[]
    : never[]

  console.log(`\n  Processing ${courts.length} valid courts with coordinates…`)

  if (courts.length === 0) {
    console.error('  No courts to insert!')
    return
  }

  const CHUNK = 50
  let inserted = 0
  for (let i = 0; i < courts.length; i += CHUNK) {
    const chunk = courts.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('courts')
      .upsert(chunk, { onConflict: 'name,borough', ignoreDuplicates: true })
    if (error) {
      console.error(`  Chunk ${Math.floor(i / CHUNK) + 1} error:`, error.message)
    } else {
      inserted += chunk.length
    }
    process.stdout.write(`\r  Inserted: ${inserted}/${courts.length}`)
  }

  // Count by borough
  const { data: counts } = await supabase
    .from('courts')
    .select('borough')
    .eq('type', 'public')
  const byBorough: Record<string, number> = {}
  counts?.forEach((r: { borough: string }) => { byBorough[r.borough] = (byBorough[r.borough] ?? 0) + 1 })
  console.log('\n✅ Public courts by borough:', byBorough)
}

function getFallbackCourts(): NycFacility[] {
  return [
    { name: 'West 4th Street Courts', borough: 'manhattan', address: 'Sixth Ave & W 4th St, New York, NY 10012', location_1: { latitude: '40.7308', longitude: '-74.0004' } },
    { name: 'Rucker Park', borough: 'manhattan', address: '155th St & 8th Ave, New York, NY 10039', location_1: { latitude: '40.8307', longitude: '-73.9389' } },
    { name: 'Holcombe Rucker Park', borough: 'manhattan', address: '2090 Frederick Douglass Blvd, New York, NY 10026', location_1: { latitude: '40.8010', longitude: '-73.9530' } },
    { name: 'Tompkins Square Park Courts', borough: 'manhattan', address: 'E 9th St & Ave B, New York, NY 10009', location_1: { latitude: '40.7268', longitude: '-73.9815' } },
    { name: 'Pier 2 Courts', borough: 'brooklyn', address: 'Brooklyn Bridge Park, Brooklyn, NY 11201', location_1: { latitude: '40.6961', longitude: '-73.9985' } },
    { name: 'Marcy Playground', borough: 'brooklyn', address: 'Marcus Garvey Blvd & DeKalb Ave, Brooklyn', location_1: { latitude: '40.6985', longitude: '-73.9494' } },
    { name: 'Goose Park', borough: 'brooklyn', address: 'Nostrand Ave & Flatbush Ave, Brooklyn, NY', location_1: { latitude: '40.6501', longitude: '-73.9496' } },
    { name: 'Domino Park', borough: 'brooklyn', address: '15 River St, Brooklyn, NY 11249', location_1: { latitude: '40.7156', longitude: '-73.9701' } },
    { name: 'Flushing Meadows Courts', borough: 'queens', address: 'Flushing Meadows Corona Park, Queens, NY 11368', location_1: { latitude: '40.7282', longitude: '-73.8403' } },
    { name: 'Roy Wilkins Park', borough: 'queens', address: '177-01 Baisley Blvd, Jamaica, NY 11434', location_1: { latitude: '40.6724', longitude: '-73.7637' } },
    { name: 'Juniper Valley Park', borough: 'queens', address: 'Cooper Ave, Middle Village, NY 11379', location_1: { latitude: '40.7182', longitude: '-73.8720' } },
    { name: 'Astoria Park Courts', borough: 'queens', address: 'Shore Blvd, Astoria, NY 11102', location_1: { latitude: '40.7812', longitude: '-73.9243' } },
    { name: 'Mullaly Park', borough: 'bronx', address: '930 River Ave, Bronx, NY 10452', location_1: { latitude: '40.8249', longitude: '-73.9239' } },
    { name: 'Crotona Park', borough: 'bronx', address: '1700 Fulton Ave, Bronx, NY 10457', location_1: { latitude: '40.8420', longitude: '-73.8965' } },
    { name: 'Soundview Park', borough: 'bronx', address: '1700 Lafayette Ave, Bronx, NY 10473', location_1: { latitude: '40.8132', longitude: '-73.8762' } },
    { name: 'Pelham Bay Park Courts', borough: 'bronx', address: 'Pelham Bay Park, Bronx, NY 10464', location_1: { latitude: '40.8676', longitude: '-73.8070' } },
    { name: 'Clove Lakes Park', borough: 'staten island', address: 'Victory Blvd, Staten Island, NY 10301', location_1: { latitude: '40.6293', longitude: '-74.1139' } },
    { name: 'Willowbrook Park', borough: 'staten island', address: 'Richmond Ave, Staten Island, NY 10314', location_1: { latitude: '40.5943', longitude: '-74.1617' } },
  ]
}

seedPublicCourts().catch(console.error)
