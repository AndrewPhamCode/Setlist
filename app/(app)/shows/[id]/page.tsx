import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { and, avg, count, eq, ne } from 'drizzle-orm'
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows, profiles, follows } from '@/lib/db/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarDisplay } from '@/components/star-rating'
import { SpotifyTrack } from '@/components/spotify-track'
import { FollowButton } from '@/components/follow-button'
import { getArtistImage } from '@/lib/spotify'
import { artistHue, formatDate, getInitials } from '@/lib/utils'

export default async function ShowDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const [show] = await db
    .select({
      id: shows.id,
      userId: shows.userId,
      artist: shows.artist,
      venue: shows.venue,
      city: shows.city,
      showDate: shows.showDate,
      rating: shows.rating,
      review: shows.review,
      highlightSong: shows.highlightSong,
      highlightTrackUri: shows.highlightTrackUri,
      imageUrl: shows.imageUrl,
      createdAt: shows.createdAt,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(shows)
    .innerJoin(profiles, eq(shows.userId, profiles.id))
    .where(eq(shows.id, id))
    .limit(1)

  if (!show) notFound()

  const hue = artistHue(show.artist)
  const h2 = (hue + 55) % 360

  // Resolve banner image
  const bannerUrl =
    show.imageUrl ?? (await getArtistImage(show.artist).catch(() => null))

  // Co-attendees: other users who logged the same artist + date
  const coAttendees = await db
    .select({
      id: shows.id,
      userId: shows.userId,
      rating: shows.rating,
      review: shows.review,
      highlightSong: shows.highlightSong,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(shows)
    .innerJoin(profiles, eq(shows.userId, profiles.id))
    .where(
      and(
        eq(shows.artist, show.artist),
        eq(shows.showDate, show.showDate),
        ne(shows.userId, show.userId)
      )
    )
    .limit(20)

  // Aggregate stats
  const [stats] = await db
    .select({ total: count(), avgRating: avg(shows.rating) })
    .from(shows)
    .where(and(eq(shows.artist, show.artist), eq(shows.showDate, show.showDate)))

  const totalLogged = stats?.total ?? 1
  const avgRating = stats?.avgRating ? Math.round(Number(stats.avgRating) * 10) / 10 : null

  // Auth state for follow buttons
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Which co-attendees the current user already follows
  let followingSet = new Set<string>()
  if (user && coAttendees.length > 0) {
    const followRows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, user.id))
    followingSet = new Set(followRows.map((r) => r.followingId))
  }

  const logUrl = `/shows/new?artist=${encodeURIComponent(show.artist)}&venue=${encodeURIComponent(show.venue)}&city=${encodeURIComponent(show.city)}&date=${show.showDate}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={show.username ? `/u/${show.username}` : '/'}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {show.displayName ?? show.username ?? 'Back'}
      </Link>

      {/* Show card */}
      <div className="rounded-2xl border border-white/[0.07] bg-card overflow-hidden">
        {/* Banner */}
        {bannerUrl ? (
          <div className="relative aspect-[2/1] overflow-hidden">
            <Image
              src={bannerUrl}
              alt={show.artist}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="font-black text-3xl text-white tracking-tight leading-tight drop-shadow-md">
                {show.artist}
              </h1>
              <div className="mt-2">
                <StarDisplay rating={show.rating} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative h-36 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, oklch(0.34 0.24 ${hue}), oklch(0.20 0.14 ${h2}))`,
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `radial-gradient(circle, white 1.2px, transparent 1.2px)`,
                backgroundSize: '20px 20px',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute bottom-3 left-5 right-5 z-10">
              <h1 className="font-black text-3xl tracking-tight leading-tight drop-shadow-lg">
                {show.artist}
              </h1>
            </div>
          </div>
        )}

        <div className="px-5 pb-5 pt-4 space-y-4">
          {!bannerUrl && <StarDisplay rating={show.rating} />}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {(show.venue || show.city) && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" style={{ color: `oklch(0.65 0.18 ${hue})` }} />
                {[show.venue, show.city].filter(Boolean).join(' · ')}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" style={{ color: `oklch(0.65 0.18 ${hue})` }} />
              {formatDate(show.showDate)}
            </span>
          </div>

          {/* Highlight song */}
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
              className="text-sm text-muted-foreground leading-relaxed pl-3 italic border-l-2"
              style={{ borderColor: `oklch(0.50 0.22 ${hue} / 0.5)` }}
            >
              {show.review}
            </p>
          )}

          {/* Logged by */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            <Avatar size="sm">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: `oklch(0.28 0.14 ${hue} / 0.8)`,
                  color: `oklch(0.85 0.12 ${hue})`,
                }}
              >
                {getInitials(show.displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Logged by</span>
            {show.username && (
              <Link href={`/u/${show.username}`} className="text-sm font-medium hover:text-primary transition-colors">
                {show.displayName ?? show.username}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.07] bg-card">
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 shrink-0" style={{ color: `oklch(0.65 0.18 ${hue})` }} />
          <span className="font-semibold">{totalLogged}</span>
          <span className="text-muted-foreground">{totalLogged === 1 ? 'person logged this show' : 'people logged this show'}</span>
        </div>
        {avgRating !== null && (
          <>
            <div className="w-px h-4 bg-white/[0.1]" />
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-yellow-400">★</span>
              <span className="font-semibold">{avgRating}</span>
              <span className="text-muted-foreground">avg rating</span>
            </div>
          </>
        )}
        <div className="ml-auto">
          <Link
            href={logUrl}
            className="text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity px-3 py-1.5 rounded-lg"
            style={{ background: `linear-gradient(135deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))` }}
          >
            Log this show
          </Link>
        </div>
      </div>

      {/* Who else was there */}
      {coAttendees.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full shrink-0"
              style={{ background: `linear-gradient(180deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))` }}
            />
            <h2 className="text-lg font-black tracking-tight">Who else was there</h2>
          </div>

          <div className="space-y-2">
            {coAttendees.map((attendee) => {
              const aHue = artistHue(attendee.username ?? attendee.userId)
              const isFollowing = followingSet.has(attendee.userId)
              const isMe = user?.id === attendee.userId

              return (
                <div
                  key={attendee.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-card hover:border-white/15 transition-colors"
                >
                  <Link href={`/u/${attendee.username}`} className="shrink-0 mt-0.5">
                    <Avatar size="sm">
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: `oklch(0.28 0.14 ${aHue} / 0.8)`,
                          color: `oklch(0.85 0.12 ${aHue})`,
                        }}
                      >
                        {getInitials(attendee.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/u/${attendee.username}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                      >
                        {attendee.displayName ?? attendee.username}
                      </Link>
                      <StarDisplay rating={attendee.rating} />
                    </div>
                    {attendee.review && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                        &ldquo;{attendee.review}&rdquo;
                      </p>
                    )}
                    {attendee.highlightSong && (
                      <p className="text-xs text-muted-foreground">
                        🎵 {attendee.highlightSong}
                      </p>
                    )}
                  </div>
                  {user && !isMe && (
                    <div className="shrink-0">
                      <FollowButton followingId={attendee.userId} isFollowing={isFollowing} />
                    </div>
                  )}
                  {!user && attendee.username && (
                    <Link
                      href={`/u/${attendee.username}`}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state when no one else logged it */}
      {coAttendees.length === 0 && (
        <div className="text-center py-10 space-y-2 rounded-xl border border-white/[0.07] border-dashed">
          <p className="text-2xl">🎤</p>
          <p className="text-sm font-semibold">You were the only one who logged this show</p>
          <p className="text-xs text-muted-foreground">Share the link and see who else was there.</p>
        </div>
      )}
    </div>
  )
}
