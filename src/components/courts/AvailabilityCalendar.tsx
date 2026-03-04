'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTimeSlots } from '@/hooks/useBooking'
import { getNextDays, formatDate, formatTime, formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'

interface AvailabilityCalendarProps {
  courtId: string
}

export function AvailabilityCalendar({ courtId }: AvailabilityCalendarProps) {
  const days = getNextDays(7)
  const [selectedDate, setSelectedDate] = useState(days[0])
  const { slots, loading } = useTimeSlots(courtId, selectedDate)

  const availableSlots = slots.filter((s) => s.status === 'available')

  return (
    <div>
      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {days.map((d) => {
          const date = new Date(d + 'T00:00:00')
          const isSelected = d === selectedDate
          return (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all duration-200',
                isSelected
                  ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              )}
            >
              <span className="text-xs font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">{date.getDate()}</span>
            </button>
          )
        })}
      </div>

      {/* Slots grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-4">No slots for this day</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => {
            const available = slot.status === 'available'
            return (
              <Link
                key={slot.id}
                href={available ? `/courts/${courtId}/book?slot=${slot.id}` : '#'}
                className={cn(
                  'flex flex-col items-center p-2.5 rounded-xl border text-center transition-all duration-200',
                  available
                    ? 'bg-white border-slate-200 hover:border-[#FF6B2C] hover:shadow-sm cursor-pointer'
                    : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-xs font-medium text-slate-600">
                  {formatTime(slot.start_time)}
                </span>
                <span className={cn('text-sm font-bold mt-0.5', available ? 'text-[#FF6B2C]' : 'text-slate-400')}>
                  {available ? formatPrice(slot.price) : slot.status === 'booked' ? 'Booked' : 'Held'}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {availableSlots.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-3">
          {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
        </p>
      )}
    </div>
  )
}
