'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { follows, profiles } from '@/lib/db/schema'

async function getUsername(userId: string): Promise<string | null> {
  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)
  return profile?.username ?? null
}

export async function followUser(followingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await db
    .insert(follows)
    .values({ followerId: user.id, followingId })
    .onConflictDoNothing()

  const username = await getUsername(followingId)
  if (username) revalidatePath(`/u/${username}`)
  revalidatePath('/feed')
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await db
    .delete(follows)
    .where(
      and(eq(follows.followerId, user.id), eq(follows.followingId, followingId))
    )

  const username = await getUsername(followingId)
  if (username) revalidatePath(`/u/${username}`)
  revalidatePath('/feed')
}
