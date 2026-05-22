import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { ShowForm } from '@/components/show-form'

export default async function NewShowPage(props: {
  searchParams: Promise<{ artist?: string; venue?: string; city?: string; date?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile?.username) redirect('/onboarding')

  const { artist, venue, city, date } = await props.searchParams
  const hasDefaults = artist || venue || city || date

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log a show</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {hasDefaults ? `Logging ${artist ?? 'show'} — fill in any missing details.` : "Record a concert you've attended."}
        </p>
      </div>
      <ShowForm defaults={{ artist, venue, city, date }} />
    </div>
  )
}
