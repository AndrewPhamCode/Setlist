import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { count, inArray } from 'drizzle-orm'
import * as schema from './schema'

// Lazy singleton — avoids connection at module load time (safe for builds)
let _db: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!_db) {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false })
    _db = drizzle(client, { schema })
  }
  return _db
}

// Convenience alias — most callers use this
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>]
  },
})

// Returns a map of showId -> number of OTHER users who logged the same artist+date
export async function getAttendeeCounts(
  shows: { id: string; artist: string; showDate: string }[]
): Promise<Map<string, number>> {
  if (shows.length === 0) return new Map()
  const uniqueArtists = [...new Set(shows.map((s) => s.artist))]
  const rows = await getDb()
    .select({
      artist: schema.shows.artist,
      showDate: schema.shows.showDate,
      total: count(),
    })
    .from(schema.shows)
    .where(inArray(schema.shows.artist, uniqueArtists))
    .groupBy(schema.shows.artist, schema.shows.showDate)

  const totals = new Map(rows.map((r) => [`${r.artist}|||${r.showDate}`, r.total]))
  const result = new Map<string, number>()
  for (const show of shows) {
    const total = totals.get(`${show.artist}|||${show.showDate}`) ?? 1
    if (total > 1) result.set(show.id, total - 1)
  }
  return result
}
