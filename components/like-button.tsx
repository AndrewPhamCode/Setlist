'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { likeShow, unlikeShow } from '@/lib/actions/likes'
import { cn } from '@/lib/utils'

export function LikeButton({
  showId,
  likeCount: initialCount,
  isLiked: initialIsLiked,
}: {
  showId: string
  likeCount: number
  isLiked: boolean
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const next = !isLiked
    setIsLiked(next)
    setCount((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      if (next) await likeShow(showId)
      else await unlikeShow(showId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors cursor-pointer',
        isLiked
          ? 'text-pink-500'
          : 'text-muted-foreground hover:text-pink-500'
      )}
    >
      <Heart
        className={cn('size-4', isLiked && 'fill-pink-500')}
        strokeWidth={isLiked ? 0 : 1.5}
      />
      <span>{count > 0 ? count : ''}</span>
    </button>
  )
}

export function LikeDisplay({ likeCount }: { likeCount: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Heart className="size-4" strokeWidth={1.5} />
      <span>{likeCount > 0 ? likeCount : ''}</span>
    </div>
  )
}
