'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows, profiles } from '@/lib/db/schema'
import { getArtistImage, getTrackUri } from '@/lib/spotify'

const showSchema = z.object({
  artist: z.string().min(1, 'Artist is required').max(200),
  venue: z.string().min(1, 'Venue is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  rating: z.coerce.number().int().min(1, 'Please select a rating').max(5),
  review: z.string().max(500).optional(),
  highlightSong: z.string().max(200).optional(),
})

export type ShowState = { error: string | null }

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0 || !file.type.startsWith('image/')) return null
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()
  const { data, error } = await supabase.storage
    .from('show-images')
    .upload(path, bytes, { contentType: file.type })
  if (error || !data) return null
  return supabase.storage.from('show-images').getPublicUrl(path).data.publicUrl
}

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
    highlightSong: formData.get('highlightSong') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const imageFile = formData.get('image') as File
  const uploadedUrl = await uploadImage(supabase, user.id, imageFile)
  // Fall back to Spotify artist image if user didn't upload a photo
  const imageUrl = uploadedUrl ?? (await getArtistImage(parsed.data.artist).catch(() => null))
  const highlightTrackUri = parsed.data.highlightSong
    ? await getTrackUri(parsed.data.highlightSong, parsed.data.artist).catch(() => null)
    : null

  await db.insert(shows).values({ userId: user.id, ...parsed.data, imageUrl, highlightTrackUri })

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
    highlightSong: formData.get('highlightSong') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const imageFile = formData.get('image') as File
  const existingImageUrl = formData.get('existingImageUrl') as string | null
  const newUploadedUrl = await uploadImage(supabase, user.id, imageFile)
  // Priority: new upload > existing > Spotify artist image
  const imageUrl =
    newUploadedUrl ??
    existingImageUrl ??
    (await getArtistImage(parsed.data.artist).catch(() => null))
  const highlightTrackUri = parsed.data.highlightSong
    ? await getTrackUri(parsed.data.highlightSong, parsed.data.artist).catch(() => null)
    : null

  await db
    .update(shows)
    .set({ ...parsed.data, imageUrl, highlightTrackUri })
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
