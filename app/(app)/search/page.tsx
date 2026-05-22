import Link from 'next/link'
import { ilike, or, desc, eq } from 'drizzle-orm'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, shows } from '@/lib/db/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { getInitials, formatDate } from '@/lib/utils'

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await props.searchParams
  const query = q?.trim() ?? ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  void user

  const [matchedProfiles, matchedShows] =
    query.length > 0
      ? await Promise.all([
          db
            .select()
            .from(profiles)
            .where(
              or(
                ilike(profiles.username, `%${query}%`),
                ilike(profiles.displayName, `%${query}%`)
              )
            )
            .limit(8),
          db
            .select({
              id: shows.id,
              artist: shows.artist,
              venue: shows.venue,
              city: shows.city,
              showDate: shows.showDate,
              username: profiles.username,
              displayName: profiles.displayName,
            })
            .from(shows)
            .innerJoin(profiles, eq(shows.userId, profiles.id))
            .where(ilike(shows.artist, `%${query}%`))
            .orderBy(desc(shows.createdAt))
            .limit(20),
        ])
      : [[], []]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find people and shows.
        </p>
      </div>

      <form method="GET" action="/search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search artists or usernames…"
            className="pl-9"
            autoFocus
          />
        </div>
      </form>

      {query && (
        <div className="space-y-8">
          {/* People */}
          {matchedProfiles.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                People
              </h2>
              <div className="space-y-2">
                {matchedProfiles.map((p) => (
                  <Link
                    key={p.id}
                    href={`/u/${p.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        {getInitials(p.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {p.displayName ?? p.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        @{p.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Shows */}
          {matchedShows.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Shows
              </h2>
              <div className="space-y-2">
                {matchedShows.map((s) => (
                  <Link
                    key={s.id}
                    href={`/u/${s.username}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.artist}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.venue} · {s.city}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.showDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{s.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {matchedProfiles.length === 0 && matchedShows.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No results for "{query}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}
