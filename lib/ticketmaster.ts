export type TMEvent = {
  id: string
  name: string
  venue: string
  city: string
  date: string
  time: string
  url: string
}

export async function getUpcomingShowsForArtist(
  artist: string,
  limit = 4
): Promise<TMEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) return []

  const today = new Date().toISOString().split('T')[0]

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: artist,
    classificationName: 'music',
    sort: 'date,asc',
    size: String(limit),
    startDateTime: `${today}T00:00:00Z`,
  })

  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []

    const data = await res.json()
    const raw = data._embedded?.events ?? []

    return raw.map((e: Record<string, unknown>) => {
      const embedded = e._embedded as Record<string, unknown> | undefined
      const venueData = (embedded?.venues as Record<string, unknown>[] | undefined)?.[0]
      const dates = e.dates as Record<string, unknown> | undefined
      const start = dates?.start as Record<string, unknown> | undefined

      const venueName = (venueData?.name as string) ?? ''
      const cityName = (venueData?.city as Record<string, string> | undefined)?.name ?? ''
      const stateCode = (venueData?.state as Record<string, string> | undefined)?.stateCode ?? ''

      return {
        id: e.id as string,
        name: e.name as string,
        venue: venueName,
        city: cityName + (stateCode ? `, ${stateCode}` : ''),
        date: (start?.localDate as string) ?? '',
        time: (start?.localTime as string) ?? '',
        url: (e.url as string) ?? '',
      }
    })
  } catch {
    return []
  }
}
