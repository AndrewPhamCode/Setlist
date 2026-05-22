import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') ?? ''
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') ?? '50'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Ticketmaster API key not configured' }, { status: 500 })
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    classificationName: 'music',
    sort: 'date,asc',
    size: '20',
  })

  if (q) params.set('keyword', q)
  if (lat && lng) {
    params.set('latlong', `${lat},${lng}`)
    params.set('radius', radius)
    params.set('unit', 'miles')
  }
  if (startDate) params.set('startDateTime', `${startDate}T00:00:00Z`)
  if (endDate) params.set('endDateTime', `${endDate}T23:59:59Z`)

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: res.status })
    }

    const data = await res.json()
    const rawEvents = data._embedded?.events ?? []

    const events = rawEvents.map((e: Record<string, unknown>) => {
      const venue = (e._embedded as Record<string, unknown> | undefined)
      const venueData = (venue?.venues as Record<string, unknown>[] | undefined)?.[0]
      const dates = e.dates as Record<string, unknown> | undefined
      const start = dates?.start as Record<string, unknown> | undefined

      const venueName = (venueData?.name as string) ?? ''
      const cityName = (venueData?.city as Record<string, string> | undefined)?.name ?? ''
      const stateCode = (venueData?.state as Record<string, string> | undefined)?.stateCode ?? ''
      const cityStr = cityName + (stateCode ? `, ${stateCode}` : '')

      return {
        id: e.id as string,
        name: e.name as string,
        venue: venueName,
        city: cityStr,
        date: (start?.localDate as string) ?? '',
        time: (start?.localTime as string) ?? '',
        url: e.url as string,
      }
    })

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
