import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarDisplay } from '@/components/star-rating'
import { formatDate, getInitials } from '@/lib/utils'

type ShowCardProps = {
  show: {
    id: string
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
}

export function ShowCard({ show, profile }: ShowCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
          </Avatar>
          {profile.username ? (
            <Link
              href={`/u/${profile.username}`}
              className="text-sm font-medium hover:underline"
            >
              {profile.displayName ?? profile.username}
            </Link>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Unknown
            </span>
          )}
          <span className="text-muted-foreground/50 text-xs">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(show.showDate)}
          </span>
        </div>

        <div>
          <p className="font-semibold text-base leading-snug">{show.artist}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {show.venue} &middot; {show.city}
          </p>
        </div>

        <StarDisplay rating={show.rating} />

        {show.review && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {show.review}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
