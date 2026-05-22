'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Calendar, MapPin, X } from 'lucide-react'

type Event = {
  id: string
  name: string
  venue: string
  city: string
  date: string
}

type ShowSearchProps = {
  onSelect: (event: Event) => void
  onClear: () => void
  selected: string | null
}

export function ShowSearch({ onSelect, onClear, selected }: ShowSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Event[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/events?q=${encodeURIComponent(query.trim())}&wide=1`)
        const data = await res.json()
        setResults(data.events ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
        <p className="text-sm font-medium truncate">{selected}</p>
        <button
          type="button"
          onClick={() => {
            setQuery('')
            onClear()
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
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
          placeholder="Search for a show…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-white/[0.1] bg-card shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {results.map((event) => (
            <button
              key={event.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(event)
                setQuery('')
                setOpen(false)
              }}
              className="w-full flex items-start gap-3 px-3 py-3 hover:bg-white/[0.06] transition-colors text-left border-b border-white/[0.05] last:border-0"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold truncate">{event.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  {event.venue && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {event.venue}{event.city ? ` · ${event.city}` : ''}
                    </span>
                  )}
                  {event.date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3 shrink-0" />
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-white/[0.1] bg-card shadow-xl px-3 py-3">
          <p className="text-sm text-muted-foreground">No shows found — fill in the details below.</p>
        </div>
      )}
    </div>
  )
}
