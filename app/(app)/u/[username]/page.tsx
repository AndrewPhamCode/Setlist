import { notFound } from 'next/navigation'
import { and, count, desc, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, shows, follows } from '@/lib/db/schema'
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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg" className="mt-1">
            <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold leading-snug">
              {profile.displayName ?? profile.username}
            </h1>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm mt-1 max-w-sm">{profile.bio}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{userShows.length}</strong>{' '}
                shows
              </span>
              <span>
                <strong className="text-foreground">{followerCount}</strong>{' '}
                followers
              </span>
              <span>
                <strong className="text-foreground">{followingCount}</strong>{' '}
                following
              </span>
            </div>
          </div>
        </div>
        {!isOwnProfile && user && (
          <FollowButton followingId={profile.id} isFollowing={isFollowing} />
        )}
      </div>

      <div className="space-y-4">
        {userShows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isOwnProfile
              ? "You haven't logged any shows yet."
              : 'No shows logged yet.'}
          </p>
        ) : (
          userShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              profile={{
                username: profile.username,
                displayName: profile.displayName,
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
