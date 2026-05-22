import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { EditProfileForm } from '@/components/edit-profile-form'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from '@/components/logout-button'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile?.username) redirect('/onboarding')

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

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <LogoutButton />
      </section>
    </div>
  )
}
