import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { EditProfileForm } from '@/components/edit-profile-form'
import { FavoriteSongsEditor } from '@/components/favorite-songs-editor'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/logout-button'
import type { FavoriteSong } from '@/lib/actions/profile'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile?.username) redirect('/onboarding')

  let favoriteSongs: FavoriteSong[] = []
  try {
    const [fav] = await db
      .select({ favoriteSongs: profiles.favoriteSongs })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
    favoriteSongs = JSON.parse(fav?.favoriteSongs ?? '[]')
  } catch {
    // column not yet migrated
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          @{profile.username}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Profile</h2>
        <EditProfileForm
          defaultDisplayName={profile.displayName}
          defaultBio={profile.bio}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Favorite Songs</h2>
        <FavoriteSongsEditor songs={favoriteSongs} />
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <LogoutButton />
      </section>
    </div>
  )
}
