import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { shows } from '@/lib/db/schema'
import { EditShowForm } from '@/components/edit-show-form'

export default async function EditShowPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [show] = await db
    .select()
    .from(shows)
    .where(and(eq(shows.id, id), eq(shows.userId, user.id)))
    .limit(1)

  if (!show) notFound()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit show</h1>
        <p className="text-muted-foreground text-sm mt-1">{show.artist}</p>
      </div>
      <EditShowForm
        showId={show.id}
        defaults={{
          artist: show.artist,
          venue: show.venue,
          city: show.city,
          showDate: show.showDate,
          rating: show.rating,
          review: show.review,
        }}
      />
    </div>
  )
}
