import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { desc, eq, sql } from 'drizzle-orm'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows } from '@/lib/db/schema'
import { getArtistImage } from '@/lib/spotify'
import { getUpcomingShowsForArtist } from '@/lib/ticketmaster'
import { formatDate, artistHue } from '@/lib/utils'

export default async function ForYouPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const topArtists = await db
    .select({
      artist: shows.artist,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(shows)
    .where(eq(shows.userId, user.id))
    .groupBy(shows.artist)
    .orderBy(desc(sql`count(*)`))
    .limit(5)

  if (topArtists.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-9 rounded-full shrink-0"
            style={{ background: 'linear-gradient(180deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))' }}
          />
          <div>
            <h1 className="text-3xl font-black tracking-tight">For You</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Upcoming shows based on your taste.
            </p>
          </div>
        </div>
        <div className="text-center py-20 space-y-3">
          <p className="text-5xl">🎵</p>
          <p className="font-semibold text-lg">Nothing to recommend yet</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Log some shows and we&apos;ll find upcoming concerts by your favorite artists.
          </p>
          <Link href="/shows/new" className="inline-block mt-2 text-sm text-primary hover:underline">
            Log your first show →
          </Link>
        </div>
      </div>
    )
  }

  const sections = await Promise.all(
    topArtists.map(async ({ artist }) => {
      const [image, events] = await Promise.all([
        getArtistImage(artist).catch(() => null),
        getUpcomingShowsForArtist(artist, 4).catch(() => []),
      ])
      return { artist, image, events }
    })
  )

  const activeSections = sections.filter((s) => s.events.length > 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-9 rounded-full shrink-0"
          style={{ background: 'linear-gradient(180deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))' }}
        />
        <div>
          <h1 className="text-3xl font-black tracking-tight">For You</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Upcoming shows based on your taste.
          </p>
        </div>
      </div>

      {activeSections.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-5xl">🎤</p>
          <p className="font-semibold text-lg">No upcoming shows right now</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Check back soon — we&apos;ll surface shows by {topArtists.map((a) => a.artist).join(', ')} as
            they&apos;re announced.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {activeSections.map(({ artist, image, events }) => {
            const hue = artistHue(artist)
            return (
              <section key={artist} className="space-y-4">
                {/* Artist header */}
                <div className="flex items-center gap-3">
                  {image ? (
                    <div className="size-14 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/10">
                      <Image
                        src={image}
                        alt={artist}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="size-14 rounded-2xl shrink-0 flex items-center justify-center text-xl font-black"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.34 0.24 ${hue}), oklch(0.20 0.14 ${(hue + 55) % 360}))`,
                      }}
                    >
                      {artist[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Because you love
                    </p>
                    <p className="font-black text-xl leading-tight">{artist}</p>
                  </div>
                </div>

                {/* Events grid */}
                <div className="grid gap-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-card hover:bg-accent/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{event.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          {(event.venue || event.city) && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin
                                className="size-3 shrink-0"
                                style={{ color: `oklch(0.65 0.18 ${hue})` }}
                              />
                              {[event.venue, event.city].filter(Boolean).join(' · ')}
                            </span>
                          )}
                          {event.date && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar
                                className="size-3 shrink-0"
                                style={{ color: `oklch(0.65 0.18 ${hue})` }}
                              />
                              {formatDate(event.date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {event.url && (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/shows/new?artist=${encodeURIComponent(event.name)}&venue=${encodeURIComponent(event.venue)}&city=${encodeURIComponent(event.city)}&date=${event.date}`}
                          className="text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity px-3 py-1.5 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))`,
                          }}
                        >
                          Log
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
