'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows, profiles } from '@/lib/db/schema'

const showSchema = z.object({
  artist: z.string().min(1, 'Artist is required').max(200),
  venue: z.string().min(1, 'Venue is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  rating: z.coerce.number().int().min(1, 'Please select a rating').max(5),
  review: z.string().max(500).optional(),
})

export type ShowState = { error: string | null }

export async function logShow(
  _prev: ShowState,
  formData: FormData
): Promise<ShowState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = showSchema.safeParse({
    artist: formData.get('artist'),
    venue: formData.get('venue'),
    city: formData.get('city'),
    showDate: formData.get('showDate'),
    rating: formData.get('rating'),
    review: formData.get('review') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db.insert(shows).values({ userId: user.id, ...parsed.data })

  revalidatePath('/')
  revalidatePath('/feed')

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  redirect(profile?.username ? `/u/${profile.username}` : '/')
}

export async function editShow(
  showId: string,
  _prev: ShowState,
  formData: FormData
): Promise<ShowState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = showSchema.safeParse({
    artist: formData.get('artist'),
    venue: formData.get('venue'),
    city: formData.get('city'),
    showDate: formData.get('showDate'),
    rating: formData.get('rating'),
    review: formData.get('review') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await db
    .update(shows)
    .set(parsed.data)
    .where(and(eq(shows.id, showId), eq(shows.userId, user.id)))

  revalidatePath('/')
  revalidatePath('/feed')

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  redirect(profile?.username ? `/u/${profile.username}` : '/')
}

export async function deleteShow(showId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  await db
    .delete(shows)
    .where(and(eq(shows.id, showId), eq(shows.userId, user.id)))

  revalidatePath('/')
  revalidatePath('/feed')

  redirect(profile?.username ? `/u/${profile.username}` : '/')
}
