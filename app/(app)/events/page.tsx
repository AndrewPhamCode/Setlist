import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventDiscovery } from '@/components/event-discovery'

export default async function EventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-9 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, oklch(0.72 0.26 290), oklch(0.60 0.28 315))' }} />
        <div>
          <h1 className="text-3xl font-black tracking-tight">Events</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Find concerts near you and log them to your setlist.
          </p>
        </div>
      </div>
      <EventDiscovery />
    </div>
  )
}
