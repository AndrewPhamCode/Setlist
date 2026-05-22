// Spotify Client Credentials — no user auth required
// Token is cached in module scope (persists across requests in the same Node process)

let _token: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || !secret) return null

  if (_token && Date.now() < _token.expiresAt - 10_000) return _token.value

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) return null

  const data = await res.json()
  _token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return _token.value
}

export async function getArtistImage(artist: string): Promise<string | null> {
  const token = await getToken()
  if (!token) return null

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null

  const data = await res.json()
  const images: { url: string; width: number }[] = data.artists?.items?.[0]?.images ?? []
  // Use the medium-quality image (second entry) if available
  return images[1]?.url ?? images[0]?.url ?? null
}

export async function getTrackUri(song: string, artist: string): Promise<string | null> {
  const token = await getToken()
  if (!token) return null

  const q = `track:${song} artist:${artist}`
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null

  const data = await res.json()
  return (data.tracks?.items?.[0]?.uri as string) ?? null
}
