/**
 * Deterministic Unsplash photo assignment for courts.
 * Photos are assigned based on court ID so the same court always gets the same photo.
 */

const BASE = 'https://images.unsplash.com/photo-'
const PARAMS = '?w=800&h=500&fit=crop&q=80&auto=format'

// Curated outdoor basketball court / streetball photos
export const OUTDOOR_PHOTOS: string[] = [
  `${BASE}1546519638405-a9c0d51ca0b7${PARAMS}`,
  `${BASE}1574629810360-7efbbe195018${PARAMS}`,
  `${BASE}1552674605-db5fecabfe68${PARAMS}`,
  `${BASE}1577223625816-7225dec31b8e${PARAMS}`,
  `${BASE}1519861531473-9200fd9b48f2${PARAMS}`,
  `${BASE}1504450758481-7338eba7524a${PARAMS}`,
  `${BASE}1587280501635-68a0e82cd5ff${PARAMS}`,
  `${BASE}1598300042247-d088f8ab3a91${PARAMS}`,
  `${BASE}1558618666-fcd25c85cd64${PARAMS}`,
  `${BASE}1543299247-83d4cc2fd67c${PARAMS}`,
  `${BASE}1547083906-8a10a842e9d3${PARAMS}`,
  `${BASE}1518611012118-696072aa579a${PARAMS}`,
  `${BASE}1567802721498-42b3b8a9cdce${PARAMS}`,
  `${BASE}1571019614242-c5c5dee9f50b${PARAMS}`,
  `${BASE}1580130732478-4e339fb33657${PARAMS}`,
  `${BASE}1585974738773-5be5c5bef7c6${PARAMS}`,
  `${BASE}1612872087720-bb876e2e67d1${PARAMS}`,
  `${BASE}1564769662533-4f00a87b4056${PARAMS}`,
  `${BASE}1528491307334-8154b8209f08${PARAMS}`,
  `${BASE}1475403614135-5f1aa0eb5015${PARAMS}`,
]

// Curated indoor gymnasium / hardwood court photos
export const INDOOR_PHOTOS: string[] = [
  `${BASE}1588473894701-af6d53f46af9${PARAMS}`,
  `${BASE}1547347528-f0d90dd9c1d4${PARAMS}`,
  `${BASE}1504450761321-b44f5b5a6826${PARAMS}`,
  `${BASE}1599058917212-d750089bc07e${PARAMS}`,
  `${BASE}1521478086-a1a5b7e44e9e${PARAMS}`,
  `${BASE}1569953875166-a1f2e81d1d88${PARAMS}`,
  `${BASE}1584735935682-e79b3f2ec942${PARAMS}`,
  `${BASE}1526232761682-d26e03ac148e${PARAMS}`,
  `${BASE}1593341646782-e40e07fc7e91${PARAMS}`,
  `${BASE}1516274626895-5f0b27454b5e${PARAMS}`,
  `${BASE}1606579853634-b0e30b6ab3bf${PARAMS}`,
  `${BASE}1528143358888-6d3c7f67bd5b${PARAMS}`,
  `${BASE}1575052814086-f385e2e2ad1b${PARAMS}`,
  `${BASE}1534452203293-dd4a9ac1248e${PARAMS}`,
  `${BASE}1541534741688-6078c5cbcf30${PARAMS}`,
]

/**
 * Returns a deterministic Unsplash photo URL for a court.
 * The same court ID always returns the same photo.
 */
export function getCourtPhoto(id: string, type: 'indoor' | 'outdoor'): string {
  const photos = type === 'indoor' ? INDOOR_PHOTOS : OUTDOOR_PHOTOS
  // Simple hash: sum char codes mod array length
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % photos.length
  }
  return photos[hash]
}

/**
 * For seeding: generates a deterministic photo based on a name string
 * (used before we have a UUID).
 */
export function getPhotoByName(name: string, type: 'indoor' | 'outdoor'): string {
  return getCourtPhoto(name, type)
}
