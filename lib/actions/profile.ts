'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or fewer')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be 50 characters or fewer'),
})

export type ProfileState = { error: string | null }

export async function completeOnboarding(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const parsed = onboardingSchema.safeParse({
    username: formData.get('username'),
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { username, displayName } = parsed.data

  // Check username availability (exclude current user)
  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  if (existing.length > 0 && existing[0].id !== user.id) {
    return { error: 'Username is already taken' }
  }

  await db
    .insert(profiles)
    .values({ id: user.id, username, displayName })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { username, displayName },
    })

  redirect('/')
}
