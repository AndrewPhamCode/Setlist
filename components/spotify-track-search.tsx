'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Search, X, Music } from 'lucide-react'
import type { SpotifyTrackResult } from '@/lib/spotify'

type Props = {
  onSelect: (track: SpotifyTrackResult) => void
  onClear: () => void
  selected: SpotifyTrackResult | null
}

export function SpotifyTrackSearch({ onSelect, onClear, selected }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrackResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query.trim())}`)
        const data: SpotifyTrackResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
        {selected.albumArt ? (
          <Image src={selected.albumArt} alt={selected.name} width={36} height={36} className="size-9 rounded-md object-cover shrink-0" />
        ) : (
          <div className="size-9 rounded-md bg-white/10 flex items-center justify-center shrink-0">
            <Music className="size-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{selected.name}</p>
          <p className="text-xs text-muted-foreground truncate">{selected.artist}</p>
        </div>
        <button type="button" onClick={onClear} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a song…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-white/[0.1] bg-card shadow-2xl overflow-hidden">
          {results.map((track) => (
            <button
              key={track.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(track); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left border-b border-white/[0.05] last:border-0"
            >
              {track.albumArt ? (
                <Image src={track.albumArt} alt={track.name} width={40} height={40} className="size-10 rounded-md object-cover shrink-0" />
              ) : (
                <div className="size-10 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                  <Music className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{track.name}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
