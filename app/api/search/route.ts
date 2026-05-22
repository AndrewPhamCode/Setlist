import { NextRequest, NextResponse } from 'next/server'
import { ilike, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 1) return NextResponse.json([])

  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .where(
      or(
        ilike(profiles.username, `%${q}%`),
        ilike(profiles.displayName, `%${q}%`)
      )
    )
    .limit(6)

  return NextResponse.json(results)
}
