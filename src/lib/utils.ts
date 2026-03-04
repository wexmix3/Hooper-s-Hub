import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Distance Calculation ─────────────────────────────────────────────────────

/** Haversine formula — returns distance in miles */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Format distance for display */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft`
  if (miles < 0.5) return `${Math.round(miles * 20) / 20} mi`
  return `${miles.toFixed(1)} mi`
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/** Format cents to USD string */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

// ─── Time ──────────────────────────────────────────────────────────────────────

/** Convert HH:MM:SS to "6:00 PM" */
export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/** Format YYYY-MM-DD to "Mon, Mar 3" */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** Get next N days as YYYY-MM-DD strings */
export function getNextDays(n: number): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/** Returns minutes ago / hours ago for timestamps */
export function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/** Check if a crowd report is fresh (within 2 hours) */
export function isCrowdFresh(reportedAt: string): boolean {
  return Date.now() - new Date(reportedAt).getTime() < 2 * 60 * 60 * 1000
}

// ─── Borough Formatting ───────────────────────────────────────────────────────

export const BOROUGH_LABELS: Record<string, string> = {
  manhattan: 'Manhattan',
  brooklyn: 'Brooklyn',
  queens: 'Queens',
  bronx: 'The Bronx',
  staten_island: 'Staten Island',
}

export const BOROUGH_CENTERS: Record<string, [number, number]> = {
  manhattan: [-73.9712, 40.7831],
  brooklyn: [-73.9442, 40.6782],
  queens: [-73.7949, 40.7282],
  bronx: [-73.8648, 40.8448],
  staten_island: [-74.1502, 40.5795],
}

// ─── Skill Level ──────────────────────────────────────────────────────────────

export const SKILL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  any: 'All Levels',
}

// ─── Rating Stars ──────────────────────────────────────────────────────────────

export function ratingToStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

export function boroughToSlug(borough: string): string {
  return borough.replace('_', '-')
}

export function slugToBorough(slug: string): string {
  return slug.replace('-', '_')
}
