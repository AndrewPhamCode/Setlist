import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarDisplay } from '@/components/star-rating'
import { LikeButton, LikeDisplay } from '@/components/like-button'
import { ShowActions } from '@/components/show-actions'
import { SpotifyTrack } from '@/components/spotify-track'
import { formatDate, getInitials, artistHue } from '@/lib/utils'

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
    highlightSong?: string | null
    highlightTrackUri?: string | null
    imageUrl?: string | null
    createdAt: Date
  }
  profile: {
    username: string | null
    displayName: string | null
  }
  likeCount: number
  isLiked: boolean
  currentUserId: string | null
  attendeeCount?: number
}

export function ShowCard({
  show,
  profile,
  likeCount,
  isLiked,
  currentUserId,
  attendeeCount = 0,
}: ShowCardProps) {
  const isOwner = currentUserId === show.userId
  const hue = artistHue(show.artist)
  const h2 = (hue + 55) % 360

  return (
    <div
      className="group rounded-2xl border border-white/[0.07] bg-card overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:-translate-y-0.5"
      style={{
        boxShadow: '0 2px 20px oklch(0 0 0 / 0.3)',
      }}
    >
      {/* Top — image or gradient banner */}
      {show.imageUrl ? (
        <div className="relative aspect-[2/1] overflow-hidden">
          <Image
            src={show.imageUrl}
            alt={`${show.artist} at ${show.venue}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 700px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link href={`/shows/${show.id}`} className="font-black text-2xl text-white tracking-tight leading-tight drop-shadow-md hover:underline underline-offset-2">
              {show.artist}
            </Link>
            <div className="mt-1.5">
              <StarDisplay rating={show.rating} />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative h-28 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, oklch(0.34 0.24 ${hue}), oklch(0.20 0.14 ${h2}))`,
          }}
        >
          {/* Dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1.2px, transparent 1.2px)`,
              backgroundSize: '20px 20px',
            }}
          />
          {/* Shine streak */}
          <div
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
            style={{ background: `oklch(0.80 0.30 ${hue})` }}
          />
          {/* Fade to card */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-card to-transparent" />
          {/* Artist name overlapping the gradient */}
          <div className="absolute bottom-2 left-4 right-4 z-10">
            <Link href={`/shows/${show.id}`} className="font-black text-2xl tracking-tight leading-tight drop-shadow-lg hover:underline underline-offset-2">
              {show.artist}
            </Link>
          </div>
        </div>
      )}

      <div className={show.imageUrl ? 'px-4 pb-4 pt-3.5 space-y-3' : 'px-4 pb-4 pt-2 space-y-3'}>
        {/* Stars (image case — already shown on overlay; no-image case) */}
        {!show.imageUrl && <StarDisplay rating={show.rating} />}

        {/* Venue + city + date */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(show.venue || show.city) && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin
                className="size-3.5 shrink-0"
                style={{ color: `oklch(0.65 0.18 ${hue})` }}
              />
              {show.venue}
              {show.venue && show.city && (
                <span className="text-border/80 mx-0.5">·</span>
              )}
              {show.city}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar
              className="size-3.5 shrink-0"
              style={{ color: `oklch(0.65 0.18 ${hue})` }}
            />
            {formatDate(show.showDate)}
          </span>
        </div>

        {/* Song of the night */}
        {show.highlightSong && (
          <SpotifyTrack
            song={show.highlightSong}
            trackUri={show.highlightTrackUri ?? null}
            hue={hue}
          />
        )}

        {/* Review */}
        {show.review && (
          <p
            className="text-sm text-muted-foreground leading-relaxed line-clamp-3 pl-3 italic border-l-2"
            style={{ borderColor: `oklch(0.50 0.22 ${hue} / 0.5)` }}
          >
            {show.review}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="sm">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: `oklch(0.28 0.14 ${hue} / 0.8)`,
                  color: `oklch(0.85 0.12 ${hue})`,
                }}
              >
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
            {profile.username ? (
              <Link
                href={`/u/${profile.username}`}
                className="text-sm font-medium hover:text-primary transition-colors truncate"
              >
                {profile.displayName ?? profile.username}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Unknown</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {attendeeCount > 0 && (
              <Link
                href={`/shows/${show.id}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
              >
                <span style={{ color: `oklch(0.65 0.18 ${hue})` }}>●</span>
                {attendeeCount} other{attendeeCount !== 1 ? 's' : ''} were there
              </Link>
            )}
            {currentUserId ? (
              <LikeButton showId={show.id} likeCount={likeCount} isLiked={isLiked} />
            ) : (
              <LikeDisplay likeCount={likeCount} />
            )}
            {isOwner && <ShowActions showId={show.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}
