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
      <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
        {/* Banner */}
        <div
          className="h-28 relative"
          style={{
            background: `linear-gradient(135deg, oklch(0.30 0.20 ${((username.charCodeAt(0) * 31 + username.charCodeAt(1 % username.length)) % 360 + 360) % 360}), oklch(0.18 0.12 ${((username.charCodeAt(0) * 31 + username.charCodeAt(1 % username.length) + 55) % 360 + 360) % 360}))`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isOwnProfile && (
              <Link
                href="/settings"
                className="text-white/70 hover:text-white transition-colors p-2 rounded-lg bg-black/20 hover:bg-black/40 backdrop-blur-sm"
              >
                <Settings className="size-4" />
              </Link>
            )}
            {!isOwnProfile && user && (
              <FollowButton followingId={profile.id} isFollowing={isFollowing} />
            )}
          </div>
        </div>

        {/* Avatar + info */}
        <div className="bg-card px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <Avatar size="lg" className="ring-4 ring-card shrink-0 size-16">
              <AvatarFallback className="text-xl font-black" style={{ background: `linear-gradient(135deg, oklch(0.35 0.20 ${((username.charCodeAt(0) * 31 + username.charCodeAt(1 % username.length)) % 360 + 360) % 360}), oklch(0.22 0.12 ${((username.charCodeAt(0) * 31 + username.charCodeAt(1 % username.length) + 55) % 360 + 360) % 360}))`, color: 'white' }}>
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-black leading-tight tracking-tight">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm mt-2 text-muted-foreground leading-relaxed max-w-lg">
              {profile.bio}
            </p>
          )}
          {/* Stats */}
          <div className="flex gap-1 mt-4">
            {[
              { value: userShows.length, label: 'shows' },
              { value: followerCount, label: 'followers' },
              { value: followingCount, label: 'following' },
            ].map(({ value, label }) => (
              <div key={label} className="flex-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors px-3 py-2.5 text-center">
                <p className="text-xl font-black tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shows */}
      {userShows.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🎵</p>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {userShows.map((show) => (
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
          ))}
        </div>
      )}
    </div>
  )
}
