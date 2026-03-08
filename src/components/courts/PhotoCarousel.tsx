'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CourtImage } from './CourtImage'

interface PhotoCarouselProps {
  photos: string[]
  name: string
  courtId: string
  isIndoor: boolean
}

export function PhotoCarousel({ photos, name, courtId, isIndoor }: PhotoCarouselProps) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="relative h-56 overflow-hidden">
        <CourtImage
          photos={[]}
          courtId={courtId}
          courtName={name}
          isIndoor={isIndoor}
          alt={name}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Main photo */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={photos[active]}
          alt={`${name} photo ${active + 1}`}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnails / dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === active ? 'bg-white w-5' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setActive((a) => (a - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={() => setActive((a) => (a + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
