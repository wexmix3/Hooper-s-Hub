import type { Metadata } from 'next'
import { CourtMap } from '@/components/map/CourtMap'

export const metadata: Metadata = {
  title: 'Map — Find Courts Near You',
}

export default function MapPage() {
  return <CourtMap />
}
