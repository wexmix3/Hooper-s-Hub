'use client'

import { useState } from 'react'
import { getCourtPhoto } from '@/lib/court-photos'

interface CourtImageProps {
  photos: string[]
  courtId: string
  courtName?: string
  isIndoor: boolean
  alt: string
  className?: string
  priority?: boolean
}

export function CourtImage({
  photos,
  courtId,
  courtName,
  isIndoor,
  alt,
  className = '',
  priority = false,
}: CourtImageProps) {
  const fallback = getCourtPhoto(courtId, isIndoor ? 'indoor' : 'outdoor', courtName)
  const [src, setSrc] = useState(photos[0] || fallback)
  const [errored, setErrored] = useState(false)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={errored ? fallback : src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        if (!errored) {
          setErrored(true)
          setSrc(fallback)
        }
      }}
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  )
}
