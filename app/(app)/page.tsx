import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shows, profiles } from '@/lib/db/schema'
import { ShowCard } from '@/components/show-card'

export default async function GlobalFeedPage() {
  const allShows = await db
    .select({
      id: shows.id,
      artist: shows.artist,
      venue: shows.venue,
      city: shows.city,
      showDate: shows.showDate,
      rating: shows.rating,
      review: shows.review,
      createdAt: shows.createdAt,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(shows)
    .innerJoin(profiles, eq(shows.userId, profiles.id))
    .orderBy(desc(shows.createdAt))
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every show logged on Setlist, newest first.
        </p>
      </div>
      {allShows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No shows yet — be the first to log one.
        </p>
      ) : (
        <div className="space-y-4">
          {allShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              profile={{ username: show.username, displayName: show.displayName }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
