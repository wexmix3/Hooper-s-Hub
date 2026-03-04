// ─── Core Database Types ────────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any'
  borough: string | null
  created_at: string
}

export type CourtType = 'public' | 'private'
export type SurfaceType = 'asphalt' | 'concrete' | 'hardwood' | 'rubber' | 'sport_court' | 'other'
export type Borough = 'manhattan' | 'brooklyn' | 'queens' | 'bronx' | 'staten_island'
export type CrowdLevel = 'empty' | 'few_people' | 'half_full' | 'packed'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'any'

export interface Court {
  id: string
  name: string
  type: CourtType
  address: string
  borough: Borough
  lat: number
  lng: number
  surface_type: SurfaceType | null
  indoor: boolean
  has_lights: boolean
  rim_count: number
  rim_height: string
  court_dimensions: string | null
  photos: string[]
  hourly_rate: number | null // cents, null = free
  is_bookable: boolean
  owner_id: string | null
  description: string | null
  amenities: string[]
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string
  // Computed client-side
  distance_miles?: number
  latest_crowd?: CrowdReport | null
}

export interface TimeSlot {
  id: string
  court_id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string
  status: 'available' | 'held' | 'booked' | 'cancelled'
  booked_by: string | null
  held_until: string | null
  stripe_session_id: string | null
  price: number // cents
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  court_id: string
  slot_id: string
  stripe_payment_intent: string | null
  amount: number // cents
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  // Joined
  court?: Court
  slot?: TimeSlot
}

export interface Review {
  id: string
  court_id: string
  user_id: string
  rating: number // 1-5
  comment: string | null
  tags: string[]
  photos: string[]
  created_at: string
  // Joined
  profile?: Profile
}

export interface CrowdReport {
  id: string
  court_id: string
  user_id: string
  crowd_level: CrowdLevel
  photo_url: string | null
  reported_at: string
  // Joined
  profile?: Profile
}

export interface Run {
  id: string
  court_id: string
  organizer_id: string
  title: string
  date: string // YYYY-MM-DD
  start_time: string
  end_time: string | null
  spots_total: number
  spots_filled: number
  skill_level: SkillLevel
  description: string | null
  status: 'open' | 'full' | 'cancelled' | 'completed'
  created_at: string
  // Joined
  court?: Court
  organizer?: Profile
  participants?: RunParticipant[]
}

export interface RunParticipant {
  id: string
  run_id: string
  user_id: string
  joined_at: string
  profile?: Profile
}

export interface RunMessage {
  id: string
  run_id: string
  user_id: string
  message: string
  created_at: string
  profile?: Profile
}

// ─── UI / Filter Types ───────────────────────────────────────────────────────

export interface CourtFilters {
  borough: Borough | 'all'
  indoor: boolean | null
  bookable: boolean | null
  query?: string
}

export interface RunFilters {
  borough: Borough | 'all'
  skill_level: SkillLevel | 'all'
  date?: string
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiError {
  error: string
  details?: string
}

export interface CheckoutSession {
  url: string
  session_id: string
}

// ─── Map Types ───────────────────────────────────────────────────────────────

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
}

export interface CourtGeoJSON {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
    properties: {
      id: string
      name: string
      type: CourtType
      borough: Borough
      is_bookable: boolean
      indoor: boolean
      avg_rating: number
      hourly_rate: number | null
      crowd_level?: CrowdLevel | null
    }
  }>
}

// ─── Review Tags ─────────────────────────────────────────────────────────────

export const REVIEW_TAGS = [
  { id: 'good_rims', label: 'Good Rims' },
  { id: 'no_nets', label: 'No Nets' },
  { id: 'cracked_surface', label: 'Cracked Surface' },
  { id: 'well_lit', label: 'Well Lit' },
  { id: 'clean', label: 'Clean' },
  { id: 'shaded', label: 'Shaded' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'beginner_friendly', label: 'Beginner Friendly' },
] as const

// ─── Amenity Labels ───────────────────────────────────────────────────────────

export const AMENITY_LABELS: Record<string, string> = {
  water_fountain: 'Water Fountain',
  restroom: 'Restroom',
  bleachers: 'Bleachers',
  parking: 'Parking',
  locker_room: 'Locker Room',
  wifi: 'WiFi',
  vending: 'Vending Machines',
  pro_shop: 'Pro Shop',
}

// ─── Crowd Level Config ───────────────────────────────────────────────────────

export const CROWD_CONFIG: Record<CrowdLevel, { label: string; color: string; bg: string }> = {
  empty: { label: 'Empty', color: 'text-green-600', bg: 'bg-green-100' },
  few_people: { label: 'A Few People', color: 'text-green-500', bg: 'bg-green-50' },
  half_full: { label: 'Half Full', color: 'text-amber-600', bg: 'bg-amber-100' },
  packed: { label: 'Packed', color: 'text-red-600', bg: 'bg-red-100' },
}
