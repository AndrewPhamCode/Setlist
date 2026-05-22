import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarDisplay } from '@/components/star-rating'
import { LikeButton, LikeDisplay } from '@/components/like-button'
import { ShowActions } from '@/components/show-actions'
import { formatDate, getInitials } from '@/lib/utils'

type ShowCardProps = {
  show: {
    id: string
    userId: string
    artist: string
    venue: string
    city: string
    showDate: string
    rating: number
    review: string | null
    createdAt: Date
  }
  profile: {
    username: string | null
    displayName: string | null
  }
  likeCount: number
  isLiked: boolean
  currentUserId: string | null
}

export function ShowCard({
  show,
  profile,
  likeCount,
  isLiked,
  currentUserId,
}: ShowCardProps) {
  const isOwner = currentUserId === show.userId

  return (
    <Card className="transition-all duration-150 hover:ring-foreground/20">
      <CardContent className="space-y-3.5">
        {/* Header: avatar + username + date + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="sm">
              <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
            </Avatar>
            {profile.username ? (
              <Link
                href={`/u/${profile.username}`}
                className="text-sm font-medium hover:text-primary transition-colors truncate"
              >
                {profile.displayName ?? profile.username}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                Unknown
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDate(show.showDate)}
            </span>
            {isOwner && <ShowActions showId={show.id} />}
          </div>
        </div>

        {/* Show details */}
        <div>
          <p className="font-bold text-lg leading-snug tracking-tight">
            {show.artist}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {show.venue}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              {show.city}
            </span>
          </div>
        </div>

        <StarDisplay rating={show.rating} />

        {show.review && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            "{show.review}"
          </p>
        )}

        {/* Footer: likes */}
        <div className="pt-0.5 border-t border-border/50">
          {currentUserId ? (
            <LikeButton
              showId={show.id}
              likeCount={likeCount}
              isLiked={isLiked}
            />
          ) : (
            <LikeDisplay likeCount={likeCount} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
