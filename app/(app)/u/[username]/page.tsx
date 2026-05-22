import Link from 'next/link'
import { notFound } from 'next/navigation'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, shows, follows, likes } from '@/lib/db/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ShowCard } from '@/components/show-card'
import { FollowButton } from '@/components/follow-button'
import { getInitials } from '@/lib/utils'

export default async function UserProfilePage(props: {
  params: Promise<{ username: string }>
}) {
  const { username } = await props.params

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  if (!profile) notFound()

  const [userShows, followerRows, followingRows] = await Promise.all([
    db
      .select()
      .from(shows)
      .where(eq(shows.userId, profile.id))
      .orderBy(desc(shows.createdAt)),
    db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, profile.id)),
    db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, profile.id)),
  ])

  const followerCount = followerRows[0].count
  const followingCount = followingRows[0].count

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  let isFollowing = false
  if (user && !isOwnProfile) {
    const [row] = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, profile.id)
        )
      )
      .limit(1)
    isFollowing = !!row
  }

  let likeCountMap = new Map<string, number>()
  let likedSet = new Set<string>()

  if (userShows.length > 0) {
    const showIds = userShows.map((s) => s.id)

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
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg" className="mt-1 ring-2 ring-primary/20">
            <AvatarFallback className="text-lg font-bold">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold leading-snug">
              {profile.displayName ?? profile.username}
            </h1>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm mt-1.5 max-w-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}
            <div className="flex gap-5 mt-3 text-sm">
              <span>
                <strong className="text-foreground font-semibold">
                  {userShows.length}
                </strong>{' '}
                <span className="text-muted-foreground">shows</span>
              </span>
              <span>
                <strong className="text-foreground font-semibold">
                  {followerCount}
                </strong>{' '}
                <span className="text-muted-foreground">followers</span>
              </span>
              <span>
                <strong className="text-foreground font-semibold">
                  {followingCount}
                </strong>{' '}
                <span className="text-muted-foreground">following</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwnProfile && (
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent"
            >
              <Settings className="size-4" />
            </Link>
          )}
          {!isOwnProfile && user && (
            <FollowButton followingId={profile.id} isFollowing={isFollowing} />
          )}
        </div>
      </div>

      {/* Shows */}
      <div className="space-y-4">
        {userShows.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground text-sm">
              {isOwnProfile
                ? "You haven't logged any shows yet."
                : 'No shows logged yet.'}
            </p>
            {isOwnProfile && (
              <Link href="/shows/new" className="text-sm text-primary hover:underline">
                Log your first show →
              </Link>
            )}
          </div>
        ) : (
          userShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              profile={{
                username: profile.username,
                displayName: profile.displayName,
              }}
              likeCount={likeCountMap.get(show.id) ?? 0}
              isLiked={likedSet.has(show.id)}
              currentUserId={user?.id ?? null}
            />
          ))
        )}
      </div>
    </div>
  )
}
