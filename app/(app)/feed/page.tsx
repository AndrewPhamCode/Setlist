import Link from 'next/link'
import { redirect } from 'next/navigation'
import { count, desc, eq, inArray } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows, profiles, follows, likes } from '@/lib/db/schema'
import { ShowCard } from '@/components/show-card'

export default async function FriendsFeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const following = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, user.id))

  const friendShows =
    following.length > 0
      ? await db
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
          .where(
            inArray(
              shows.userId,
              following.map((f) => f.followingId)
            )
          )
          .orderBy(desc(shows.createdAt))
          .limit(50)
      : []

  let likeCountMap = new Map<string, number>()
  let likedSet = new Set<string>()

  if (friendShows.length > 0) {
    const showIds = friendShows.map((s) => s.id)

    const likeCounts = await db
      .select({ showId: likes.showId, count: count() })
      .from(likes)
      .where(inArray(likes.showId, showIds))
      .groupBy(likes.showId)
    likeCountMap = new Map(likeCounts.map((l) => [l.showId, l.count]))

    const userLikes = await db
      .select({ showId: likes.showId })
      .from(likes)
      .where(inArray(likes.showId, showIds))
    likedSet = new Set(userLikes.map((l) => l.showId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Following</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Shows from people you follow.
        </p>
      </div>
      {following.length === 0 ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            You're not following anyone yet.
          </p>
          <Link href="/" className="text-sm text-primary hover:underline">
            Browse Discover to find people →
          </Link>
        </div>
      ) : friendShows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No shows from people you follow yet.
        </p>
      ) : (
        <div className="space-y-4">
          {friendShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              profile={{
                username: show.username,
                displayName: show.displayName,
              }}
              likeCount={likeCountMap.get(show.id) ?? 0}
              isLiked={likedSet.has(show.id)}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
