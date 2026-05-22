'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function StarRating({
  name = 'rating',
  defaultValue = 0,
}: {
  name?: string
  defaultValue?: number
}) {
  const [rating, setRating] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)
  const active = hovered || rating

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={rating} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={cn(
            'text-2xl leading-none transition-colors cursor-pointer',
            star <= active ? 'text-yellow-400' : 'text-muted-foreground/40'
          )}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            'text-sm',
            star <= rating ? 'text-yellow-400' : 'text-muted-foreground/30'
          )}
        >
          ★
        </span>
      ))}
    </div>
  )
}
