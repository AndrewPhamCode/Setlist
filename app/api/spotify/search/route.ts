import { NextRequest, NextResponse } from 'next/server'
import { searchTracks } from '@/lib/spotify'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])
  const tracks = await searchTracks(q, 6).catch(() => [])
  return NextResponse.json(tracks)
}
