'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser } from '@/lib/actions/follows'

export function FollowButton({
  followingId,
  isFollowing: initial,
}: {
  followingId: string
  isFollowing: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const next = !isFollowing
    setIsFollowing(next)
    startTransition(async () => {
      if (next) {
        await followUser(followingId)
      } else {
        await unfollowUser(followingId)
      }
    })
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
