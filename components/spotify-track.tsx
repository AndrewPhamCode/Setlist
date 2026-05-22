'use client'

import { useState } from 'react'
import { Music, ChevronDown, ChevronUp } from 'lucide-react'

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

type Props = {
  song: string
  trackUri: string | null
  hue: number
}

export function SpotifyTrack({ song, trackUri, hue }: Props) {
  const [open, setOpen] = useState(false)
  const trackId = trackUri?.split(':')[2] ?? null // "spotify:track:{id}"

  return (
    <div>
      <button
        type="button"
        onClick={() => { if (trackId) setOpen((o) => !o) }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all"
        style={{
          background: `oklch(0.28 0.14 ${hue} / 0.35)`,
          color: `oklch(0.85 0.18 ${hue})`,
          cursor: trackId ? 'pointer' : 'default',
        }}
      >
        <Music className="size-3.5 shrink-0 opacity-80" />
        <span className="flex-1 truncate text-left">{song}</span>
        {trackId ? (
          <span className="flex items-center gap-1.5 shrink-0">
            <SpotifyLogo className="size-3.5 text-[#1DB954]" />
            {open
              ? <ChevronUp className="size-3.5 opacity-60" />
              : <ChevronDown className="size-3.5 opacity-60" />}
          </span>
        ) : null}
      </button>

      {open && trackId && (
        <div className="mt-2 rounded-xl overflow-hidden">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block rounded-xl"
            style={{ border: 'none' }}
          />
        </div>
      )}
    </div>
  )
}
