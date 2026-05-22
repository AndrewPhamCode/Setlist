'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, ExternalLink, Loader2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDate, cn } from '@/lib/utils'

type Event = {
  id: string
  name: string
  venue: string
  city: string
  date: string
  time: string
  url: string
}

type Location = { lat: number; lng: number }
type DateFilter = 'all' | 'week' | 'month' | 'past'

function getDateRange(filter: DateFilter): { startDate?: string; endDate?: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (filter === 'week') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    return { startDate: today, endDate: end.toISOString().split('T')[0] }
  }
  if (filter === 'month') {
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    return { startDate: today, endDate: end.toISOString().split('T')[0] }
  }
  if (filter === 'past') {
    const start = new Date(now)
    start.setFullYear(start.getFullYear() - 2)
    return { startDate: start.toISOString().split('T')[0], endDate: today }
  }
  return { startDate: today }
}

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'Upcoming',
  week: 'This week',
  month: 'This month',
  past: 'Past shows',
}

export function EventDiscovery() {
  const [query, setQuery] = useState('')
  const [radius, setRadius] = useState('50')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [location, setLocation] = useState<Location | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const [events, setEvents] = useState<Event[]>([])
  const [dropdownEvents, setDropdownEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchEvents = useCallback(async (
    q: string,
    loc: Location | null,
    r: string,
    df: DateFilter,
    { forDropdown = false } = {}
  ) => {
    if (forDropdown) {
      setDropdownLoading(true)
    } else {
      setLoading(true)
      setError(null)
      setSearched(true)
    }

    const params = new URLSearchParams({ radius: r })
    if (q.trim()) params.set('q', q.trim())
    if (loc) {
      params.set('lat', String(loc.lat))
      params.set('lng', String(loc.lng))
    }
    const { startDate, endDate } = getDateRange(df)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)

    try {
      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
      if (forDropdown) setDropdownEvents(data.events.slice(0, 6))
      else setEvents(data.events)
    } catch (e) {
      if (!forDropdown) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
        setEvents([])
      }
    } finally {
      if (forDropdown) setDropdownLoading(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLocationStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        setLocationStatus('granted')
        fetchEvents('', loc, '50', 'all')
      },
      () => setLocationStatus('denied')
    )
  }, [fetchEvents])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.trim().length >= 2) {
      setShowDropdown(true)
      debounceRef.current = setTimeout(() => {
        fetchEvents(val, location, radius, dateFilter, { forDropdown: true })
      }, 300)
    } else {
      setShowDropdown(false)
      setDropdownEvents([])
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowDropdown(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    fetchEvents(query, location, radius, dateFilter)
  }

  const handleDropdownSelect = (event: Event) => {
    setQuery(event.name)
    setShowDropdown(false)
    fetchEvents(event.name, location, radius, dateFilter)
  }

  const handleDateFilter = (df: DateFilter) => {
    setDateFilter(df)
    if (searched || locationStatus === 'granted') {
      fetchEvents(query, location, radius, df)
    }
  }

  const handleClear = () => {
    setQuery('')
    setShowDropdown(false)
    setDropdownEvents([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (location) fetchEvents('', location, radius, dateFilter)
    else { setEvents([]); setSearched(false) }
    inputRef.current?.focus()
  }

  const logShowParams = (event: Event) => {
    const p = new URLSearchParams()
    p.set('artist', event.name)
    if (event.venue) p.set('venue', event.venue)
    if (event.city) p.set('city', event.city)
    if (event.date) p.set('date', event.date)
    return p.toString()
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => {
              if (query.trim().length >= 2 && dropdownEvents.length > 0) setShowDropdown(true)
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false) }}
            placeholder="Search artists, festivals…"
            className="pl-9 pr-8"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
              {dropdownLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : dropdownEvents.length > 0 ? (
                <ul>
                  {dropdownEvents.map((event, i) => (
                    <li
                      key={event.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 hover:bg-accent/60 transition-colors',
                        i > 0 && 'border-t border-border/50'
                      )}
                    >
                      <button
                        type="button"
                        className="flex-1 text-left min-w-0"
                        onMouseDown={(e) => { e.preventDefault(); handleDropdownSelect(event) }}
                      >
                        <p className="text-sm font-medium truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[event.venue, event.city].filter(Boolean).join(' · ')}
                          {event.date && ` — ${formatDate(event.date)}`}
                        </p>
                      </button>
                      <Link
                        href={`/shows/new?${logShowParams(event)}`}
                        onMouseDown={(e) => e.preventDefault()}
                        className="shrink-0 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-2 py-1 rounded-md"
                      >
                        Log
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-border/50">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setShowDropdown(false)
                        fetchEvents(query, location, radius, dateFilter)
                      }}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-2 hover:bg-accent/40 transition-colors"
                    >
                      See all results for &ldquo;{query}&rdquo;
                    </button>
                  </li>
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">No suggestions found</p>
              )}
            </div>
          )}
        </div>

        <select
          value={radius}
          onChange={(e) => {
            setRadius(e.target.value)
            if (searched || locationStatus === 'granted') {
              fetchEvents(query, location, e.target.value, dateFilter)
            }
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="25">25 mi</option>
          <option value="50">50 mi</option>
          <option value="100">100 mi</option>
        </select>
        <Button type="submit" size="sm">Search</Button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(DATE_FILTER_LABELS) as DateFilter[]).map((df) => (
          <button
            key={df}
            type="button"
            onClick={() => handleDateFilter(df)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              dateFilter === df
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            )}
          >
            {DATE_FILTER_LABELS[df]}
          </button>
        ))}
      </div>

      {locationStatus === 'requesting' && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          Detecting your location…
        </p>
      )}
      {locationStatus === 'denied' && !searched && (
        <p className="text-xs text-muted-foreground">
          Location access denied — search by keyword to find events anywhere.
        </p>
      )}
      {locationStatus === 'granted' && !query && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="size-3" />
          Showing events near you
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && searched && events.length === 0 && !error && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No events found. Try a different search or expand your radius.
        </p>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{event.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {(event.venue || event.city) && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {[event.venue, event.city].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {event.date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3 shrink-0" />
                      {formatDate(event.date)}
                      {event.time && ` · ${event.time.slice(0, 5)}`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                <Link
                  href={`/shows/new?${logShowParams(event)}`}
                  className="text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-2.5 py-1.5 rounded-md"
                >
                  Log show
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
