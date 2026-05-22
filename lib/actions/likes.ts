'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { likes } from '@/lib/db/schema'

export async function likeShow(showId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await db
    .insert(likes)
    .values({ userId: user.id, showId })
    .onConflictDoNothing()

  revalidatePath('/')
  revalidatePath('/feed')
}

export async function unlikeShow(showId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await db
    .delete(likes)
    .where(and(eq(likes.userId, user.id), eq(likes.showId, showId)))

  revalidatePath('/')
  revalidatePath('/feed')
}
