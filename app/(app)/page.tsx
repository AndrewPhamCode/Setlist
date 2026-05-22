import { count, desc, eq, inArray } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows, profiles, likes } from '@/lib/db/schema'
import { ShowCard } from '@/components/show-card'

export default async function GlobalFeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const allShows = await db
    .select({
      id: shows.id,
      userId: shows.userId,
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

  let likeCountMap = new Map<string, number>()
  let likedSet = new Set<string>()

  if (allShows.length > 0) {
    const showIds = allShows.map((s) => s.id)

    const likeCounts = await db
      .select({ showId: likes.showId, count: count() })
      .from(likes)
      .where(inArray(likes.showId, showIds))
      .groupBy(likes.showId)
    likeCountMap = new Map(likeCounts.map((l) => [l.showId, l.count]))

    if (user) {
      const userLikes = await db
        .select({ showId: likes.showId })
        .from(likes)
        .where(inArray(likes.showId, showIds))
      likedSet = new Set(userLikes.map((l) => l.showId))
    }
  }

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
              likeCount={likeCountMap.get(show.id) ?? 0}
              isLiked={likedSet.has(show.id)}
              currentUserId={user?.id ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
